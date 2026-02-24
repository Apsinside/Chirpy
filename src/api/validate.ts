import { Request, Response } from "express";
import { resolveTlsa } from "node:dns";

export async function handlerValidate(req: Request, res: Response){
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;
    if(params.body.length > 140){
        res.status(400).send(
            JSON.stringify({
                error: "Chirp is too long",
            })
        )
        return;
    }

    res.status(200).send(
        JSON.stringify({
            cleanedBody: filterProfanity(params.body),       
        })
    )
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