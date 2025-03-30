export interface Registration {
  name: string;
  rollno: string;
  branch: string;
  year: string;
  email: string;
  phno: string;
  paymentplatform: string;
  transactionid: string;
  paymentStatus: "pending" | "completed" | "failed";
  mailSent: boolean;
}
