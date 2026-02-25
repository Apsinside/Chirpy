import {Response, Request, NextFunction } from "express";
import { config } from "./config.js"
export function middlewareLogResponses(req: Request, res: Response, next: NextFunction){
    res.on("finish",  ()=>{
        const statusCode = res.statusCode;
        if(statusCode >= 300){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    })
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
    console.log(err.message);
    
    const message = "Something went wrong on our end";
    res.status(500).json({
        error: message,
    });
}