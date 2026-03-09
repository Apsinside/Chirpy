import { Request, Response } from "express";
import { upgradeUser } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "../errors.js";
import { config } from "../config.js";
import { getApiKey } from "../auth.js";

export async function handlerWebhook(req: Request, res: Response){
    type parameters = {
        event: string,
        data: {
            userId: string,
        };
    }

    const apiKey = getApiKey(req);
    if(config.api.polkaApiKey !== apiKey){
        throw new UnauthorizedError("Wrong API key");
    }

    const params: parameters = req.body; 
    if(!params || params.event !== "user.upgraded"){
        res.status(204).send();
        return
    }

    const result = await upgradeUser(params.data.userId);
    if(!result){
        throw new NotFoundError("User not found");
    }

    res.status(204).send();
}