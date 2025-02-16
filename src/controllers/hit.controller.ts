import { Request, Response } from "express";

// /hit?id=1
export const hit = (req: Request, res: Response) => {
    const id = req.query.id;
    if(!id) {
        res.status(400).send({
            success: false,
            message: 'id is required'
        })
    }   

    res.send({
        success: true,
        message: `Hit with id ${id} is successful`
    })
}