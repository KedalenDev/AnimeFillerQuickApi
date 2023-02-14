import { NextFunction, Request, Response } from "express";


//Handle auth via api key

const API_KEY = process.env.API_KEY;

const auth = (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-api-key'];
    if(key === API_KEY) {
        next();
        return;
    } else {
       return res.status(401).send({
            message: 'Unauthorized'
        });
    }
}

export default auth;