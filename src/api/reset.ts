import {Response, Request} from "express";
import {config} from "../config.js"

export async function handlerReset(req: Request, res: Response){
    config.api.fileserverHits = 0;
    res.write("Hits reset to 0");
    res.end();
}
