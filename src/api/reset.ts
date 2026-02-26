import {Response, Request} from "express";
import {config} from "../config.js"
import { UnauthorizedError } from "../errors.js";
import { resetUsers } from "../db/queries.js";

export async function handlerReset(req: Request, res: Response){
    if(config.api.platform !== "dev"){
        throw new UnauthorizedError("Not authorized");
    }

    config.api.fileserverHits = 0;
    await resetUsers();
    res.status(200).json({message: "Table users cleared and hits reset"});
}
