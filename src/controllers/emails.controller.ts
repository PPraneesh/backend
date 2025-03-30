import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import qrcode from "qrcode";

dotenv.config();
const ADMIN_EMAILS = ["anishs19181@gmail.com"]; //add other admin emails

//import db
//Add EMAIL_USER,EMAIL_PASS(nodemailer pass) ,ADMIN_PASS AND VERCEL_URL(for verifyParticipant route) to .env

function getEmailTemplate(user: any): string {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
            body{font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0}
            .container{max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9}
            .header{background:#fff;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1)}
            .content{background:#fff;padding:20px;border-radius:8px;margin-top:20px}
            .details{margin:20px 0;padding:15px;border:1px solid #eee;border-radius:8px}
            .qr-section{text-align:center;margin:20px 0;padding:20px;background:#f8f9fa;border-radius:8px}
            .qr-code{max-width:180px;border:3px solid #4a6dc4;border-radius:12px;margin:10px 0}
            .whatsapp{background:#dcf8c6;padding:15px;border-radius:8px;text-align:center;margin:20px 0}
            .whatsapp-btn{background:#25D366;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block}
            .event-info{background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0}
            .footer{text-align:center;background:#4a6dc4;color:#fff;padding:15px;border-radius:8px;margin-top:20px}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color:#4a6dc4;margin:0">VJ Data Questers</h1>
                <p style="margin:5px 0 0;color:#666">Cloud and AWS Workshop Registration</p>
            </div>
            <div class="content">
                <p>Dear <strong>${user.name}</strong>,</p>
                
                <div class="details">
                    <h3>Registration Details</h3>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Roll Number:</strong> ${user.rollNo}</p>
                    <p><strong>Transaction ID:</strong> ${user.transactionId}</p>
                    <p><strong>Amount Paid:</strong> ₹${user.amount}</p>
                </div>

                <div class="qr-section">
                    <h3>Your Event QR Code</h3>
                    <p>Please show this QR code at the venue</p>
                    <img src="cid:qrCode" alt="QR Code" class="qr-code">
                </div>

                <div class="whatsapp">
                    <p><strong>Join our WhatsApp group for updates!</strong></p>
                    <a href="https://chat.whatsapp.com/JUhnskQlvUI6YsrB61Gxmw" class="whatsapp-btn">
                        Join WhatsApp Group
                    </a>
                </div>

                <div class="event-info">
                    <h3>Event Details</h3>
                    <p><strong>Event:</strong> Cloud and AWS Workshop</p>
                    <p><strong>Date:</strong> March 30, 2024</p>
                    <p><strong>Time:</strong> 10:00 AM</p>
                    <p><strong>Venue:</strong> APJ Abdul Kalam Seminar Hall, Block-5</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2024 VJ Data Questers</p>
                <p>Contact: events@vjdataquesters.in</p>
            </div>
        </div>
    </body>
    </html>`;
}

// Send QR codes to registered participants
export const sendEmails = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const snapshot = await db.collection("Registrations").get();
    const users = snapshot.docs.map((doc) => doc.data());
    let successCount = 0;
    let errorCount = 0;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const user of users) {
      try {
        const uniqueId = `user_${user.rollNo}`;
        const qrDataUrl = await qrcode.toDataURL(
          `${process.env.VERCEL_URL}/verify/${uniqueId}`,
        );

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "VJ Data Questers - Registration Confirmation",
          html: getEmailTemplate(user),
          attachments: [
            {
              filename: `${user.rollNo}-qr.png`,
              content: Buffer.from(qrDataUrl.split(",")[1], "base64"),
              cid: "qrCode",
            },
          ],
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to process ${user.rollNo}:`, error);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Processed ${users.length} users`,
      results: { successful: successCount, failed: errorCount },
    });
  } catch (error) {
    console.error("Send QR error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Verify participant QR code
export const verifyParticipant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const adminEmail = req.headers["x-admin-email"] as string;
    const adminPass = req.headers["x-admin-pass"] as string;

    if (
      !ADMIN_EMAILS.includes(adminEmail) ||
      adminPass !== process.env.ADMIN_PASS
    ) {
      res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const rollNo = req.params.uniqueId.replace("user_", "");
    const userDoc = await db.collection("Registrations").doc(rollNo).get();

    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
      return;
    }

    const userData = userDoc.data();
    if (!userData) {
      res.status(404).json({
        success: false,
        message: "User data not found",
      });
      return;
    }

    if (userData.verified) {
      res.json({
        success: false,
        message: "Already verified",
        data: {
          rollNo: userData.rollNo,
          name: userData.name,
          verifiedBy: userData.verifiedBy,
          verificationTime: userData.verificationTime?.toDate().toISOString(),
        },
      });
      return;
    }

    await db.collection("Registrations").doc(rollNo).update({
      verified: true,
      verificationTime: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: adminEmail,
    });

    res.json({
      success: true,
      message: "Verification successful",
      data: {
        rollNo: userData.rollNo,
        name: userData.name,
        verifiedBy: adminEmail,
        verificationTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const adminVerify = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <title>VJ Data Questers - Admin Scanner</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <script src="https://unpkg.com/html5-qrcode@2.3.8"></script>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
                .container { text-align: center; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
                h2 { color: #4a6dc4; }
                input { margin: 10px; padding: 12px; width: 250px; border: 1px solid #ddd; border-radius: 5px; }
                #reader { width: 300px; margin: 20px auto; border: 2px solid #4a6dc4; border-radius: 10px; overflow: hidden; }
                #result { margin: 20px; padding: 15px; border-radius: 5px; font-weight: bold; }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>VJ Data Questers - Admin Scanner</h2>
                <input type="email" id="adminEmail" placeholder="Admin Email" required>
                <input type="password" id="adminPass" placeholder="Admin Password" required>
                <div id="reader"></div>
                <div id="result"></div>
            </div>

            <script>
                function onScanSuccess(decodedText) {
                    const adminEmail = document.getElementById('adminEmail').value;
                    const adminPass = document.getElementById('adminPass').value;
                    const resultDiv = document.getElementById('result');

                    if (!adminEmail || !adminPass) {
                        resultDiv.className = 'error';
                        resultDiv.innerText = 'Please enter admin credentials';
                        return;
                    }

                    fetch(decodedText, {
                        method: 'GET',
                        headers: {
                            'x-admin-email': adminEmail,
                            'x-admin-pass': adminPass,
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.json();
                    })
                    .then(data => {
                        resultDiv.className = data.success ? 'success' : 'error';
                        let message = data.message;
                        
                        if (data.data) {
                            message += '\\nName: ' + data.data.name + 
                                     '\\nRoll No: ' + data.data.rollNo;
                            if (data.data.verificationTime) {
                                message += '\\nVerified at: ' + new Date(data.data.verificationTime).toLocaleString();
                            }
                        }
                        
                        resultDiv.innerText = message;
                    })
                    .catch(error => {
                        resultDiv.className = 'error';
                        resultDiv.innerText = 'Error: ' + error.message;
                    });
                }

                window.addEventListener('load', () => {
                    try {
                        const html5QrcodeScanner = new Html5QrcodeScanner(
                            "reader",
                            { 
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                                aspectRatio: 1.0
                            }
                        );
                        html5QrcodeScanner.render(onScanSuccess);
                    } catch (error) {
                        document.getElementById('result').className = 'error';
                        document.getElementById('result').innerText = 'Scanner initialization failed: ' + error.message;
                    }
                });
            </script>
        </body>
        </html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Admin page error:", error);
    res.status(500).send(`
            <html>
                <body style="font-family: Arial; padding: 20px; text-align: center;">
                    <h1 style="color: #721c24;">Error</h1>
                    <p>${error instanceof Error ? error.message : "Unknown error occurred"}</p>
                    <a href="/" style="color: #4a6dc4;">Return to Home</a>
                </body>
            </html>
        `);
  }
};
