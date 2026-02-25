import { Request, Response } from "express";
import { resolveTlsa } from "node:dns";

export async function handlerValidate(req: Request, res: Response){
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;
    if(params.body.length > 140){
        throw new Error("Chirp to long");
    }

    res.status(200).json({
            cleanedBody: filterProfanity(params.body),       
        })
    
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