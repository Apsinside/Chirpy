import { Request, Response } from "express";
import { BadRequestError } from "../errors.js";
import { createChirp } from "../db/queries.js";

export async function  handlerChirp(req: Request, res: Response){
    type parameters = {
        body: string;
        userId: string;
    };

    const params: parameters = req.body;
    if(params.body.length > 140){
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const cleanedBody = filterProfanity(params.body);
    const result = await createChirp(
        {
            body: cleanedBody,
            userId: params.userId
        }
    )
    
    if(!result){
        throw new BadRequestError("Failed to create chirp");
    }

    res.status(201).json(result);
}

function filterProfanity(text: string) : string{
    const split = text.split(' ');
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < split.length; i++) {
        const word = split[i];
        const loweredWord = word.toLowerCase();
        if (badWords.includes(loweredWord)) {
        split[i] = "****";
        }
    }
    return split.join(' ')
}