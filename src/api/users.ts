import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors.js";
import { NewUser, RefreshToken } from "../db/schema.js";
import { createUser, getUserByID, updateUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, makeRefreshToken, validateJWT  } from "../auth.js";
import { config } from "../config.js";

type userWithoutPassword = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response){
    type parameters = {
        password: string,
        email: string;
    };

    const params: parameters = req.body;
    verifyParameters(params);

    const user: NewUser = {
        email: params.email, 
        hashedPassword: await hashPassword(params.password)
    };

    const result = await createUser(user);
    if(!result){
        throw new BadRequestError("Failed to create users")
    }

    const resBody : userWithoutPassword = {
        id: result.id,
        email: result.email,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        isChirpyRed: result.isChirpyRed
    }
    
    res.status(201).json(resBody);
}


export function verifyParameters(params : { password: string, email: string; }){ 
    if(params.email.length == 0){
        throw new BadRequestError("Missing email");
    }
    if(params.password.length == 0){
        throw new BadRequestError("Missing password");
    }
    return params;
}

export async function handlerUpdateUser(req: Request, res: Response){
    let accessTokenString = getBearerToken(req);
    const tokenUserID = validateJWT(accessTokenString!, config.jwt.secret);

    type parameters = {
        password: string,
        email: string;
    };

    const params: parameters = req.body;
    verifyParameters(params);

    const user = await getUserByID(tokenUserID);
    if(!user){
        throw new UnauthorizedError("User not found in database")
    }

    const updatedUser : NewUser = {
        id: user.id,
        email: params.email,
        hashedPassword: await hashPassword(params.password)
    }

    const updateResult = await updateUser(updatedUser);
    if(!updateResult){
        throw new UnauthorizedError("Failed to update users")
    }

    const resBody : userWithoutPassword = {
        id: updateResult.id,
        email: updateResult.email,
        createdAt: updateResult.createdAt,
        updatedAt: updateResult.updatedAt,
        isChirpyRed: updateResult.isChirpyRed
    }
    res.status(200).json(resBody);
}