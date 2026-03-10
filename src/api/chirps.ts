import { Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors.js";
import { createChirp, deleteChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerChirpsGet(req: Request, res: Response){
    const {chirpId} =  req.params;
    if(typeof chirpId !== "string"){
        throw new BadRequestError("Invalid chirp ID");
    }

    const result = await getChirp(chirpId);
    if (!result) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }

    res.status(200).json(result);
}

export async function handlerChirpsRetrieve(req: Request, res: Response){
    let authorId: undefined | string;
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }

    const result = await getChirps(authorId);
    res.status(200).json(result);
}

export async function  handlerChirpsCreate(req: Request, res: Response){      
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;

    const token = getBearerToken(req);
    const tokenUserID  = validateJWT(token, config.jwt.secret);

    if(params.body.length > 140){
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const cleanedBody = filterProfanity(params.body);
    const result = await createChirp(
        {
            body: cleanedBody,
            userId: tokenUserID
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

export async function handlerChirpsDelete(req: Request, res: Response){
    let accessTokenString = getBearerToken(req);
    const tokenUserID = validateJWT(accessTokenString!, config.jwt.secret);
    
    const {chirpId} =  req.params;
    if(typeof chirpId !== "string"){
        throw new BadRequestError("Invalid chirp ID");
    }

    const chirp = await getChirp(chirpId);
    if (!chirp ) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }
    if( chirp.userId !== tokenUserID ){
        throw new ForbiddenError("Chirp does not belong to current user");
    }

    const deleteResult = await deleteChirp(chirpId);
    if(!deleteResult){
        throw new Error(`Failed to delete chirp with chirpId: ${chirpId}`);
    }
    res.status(204).send();
}