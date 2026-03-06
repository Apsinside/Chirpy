import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request} from "express";
import {config} from "./config.js"
import crypto from "crypto";
import { BadRequestError } from "./errors.js";


export async function hashPassword(password: string){
    try {
        return await argon2.hash(password);
    } catch (err) {
        if(err instanceof Error){
            throw new Error(`Failed to create password hash with error: ${err.message}`);
        }
        throw new Error(`Failed to create password hash`);
    }
} 

export async function checkPasswordHash (password: string, hash: string){
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        if(err instanceof Error){
            throw new Error(`Failed to verify password hash with error: ${err.message}`);
        }
        throw new Error(`Failed to verify password hash`);
    }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string{
    const timestamp = Math.floor(Date.now() / 1000)
    
    const tokenPayload : payload = {
        iss: "chirpy",
        sub: userID,
        iat: timestamp,
        exp: timestamp + expiresIn,
    }

    const token = jwt.sign(tokenPayload, secret);
    return token;
}

export function validateJWT(tokenString: string, secret: string): string{
    try{
        const tokenPayload = jwt.verify(tokenString, secret);
        if(typeof tokenPayload === 'string'){
            throw new Error("Invalid token type");
        }
        if (!tokenPayload.sub) {
            throw new Error("Token is missing the subject field");
        }
        return tokenPayload.sub;
    }catch(err){
        if(err instanceof Error){
            throw new Error(`JWT validation failed with error: ${err.message}`);
        }
        throw new Error(`JWT validation failed with`);
    }
}

export function getBearerToken(req: Request): string{
    const header = req.get('Authorization');
    if(!header){
        throw new Error(`Invalid authorization header`);
    }

    const splitHeader = header.split(" ");
    if (splitHeader.length < 2 || splitHeader[0] !== "Bearer") {
        throw new BadRequestError("Malformed authorization header");
    }

    return splitHeader[1];
}

export function makeRefreshToken(): string{
    const hexString = crypto.randomBytes(32).toString('hex');
    return hexString;
} 