import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors.js";
import { NewUser, RefreshToken } from "../db/schema.js";
import { createUser, getUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, makeRefreshToken  } from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken, getRefreshTokenFromTokenString, getUserFromRefreshToken } from "../db/queries/refresh.js";
import { ExtraConfigColumn } from "drizzle-orm/pg-core/index.js";


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
        updatedAt: result.updatedAt
    }
    
    res.status(201).json(resBody);
}


export function verifyParameters(params : { password: string, email: string; }){ 
    if(params.email.length == 0){
        throw new BadRequestError("Missing email for new user");
    }
    if(params.password.length == 0){
        throw new BadRequestError("Missing password for new user");
    }
    return params;
}
