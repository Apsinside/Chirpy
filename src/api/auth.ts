import { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../errors.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken,  } from "../auth.js";
import { config } from "../config.js";
import { verifyParameters } from "../api/users.js"
import {createRefreshToken, getRefreshTokenFromTokenString, getUserFromRefreshToken, revokeRefreshToken} from "../db/queries/refresh.js"
import {RefreshToken} from "../db/schema.js"

export async function handlerLoginUser(req: Request, res: Response){
    type parameters = {
        password: string,
        email: string;
    };
   
    const params: parameters = req.body;
    verifyParameters(params);
    const user = await getUserByEmail(params.email);
    if(!user){
        throw new NotFoundError("User does not exist");
    }

    const result = await checkPasswordHash(params.password, user.hashedPassword);
    if(!result){
        throw new UnauthorizedError("Invalid password")
    }

    // 1h
    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    
    const refreshTokenString = makeRefreshToken();

    const saveResult = saveRefreshToken(user.id, refreshTokenString)
    if(!saveResult){
        throw new UnauthorizedError("Failed to safe refresh token");
    }

    const resBody = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
        refreshToken: refreshTokenString
    }

    res.status(200).json(resBody);
}

async function saveRefreshToken(userID: string, refreshTokenString: string){
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 60);

    const refreshToken: RefreshToken= {
        token: refreshTokenString,
        userID: userID,
        expiresAt: expirationDate
    }

    const insertResult = await createRefreshToken(refreshToken);
    return insertResult;
}

export async function handlerRefresh(req: Request, res: Response){
    const refreshTokenString = getBearerToken(req);
    const refreshToken = await getRefreshTokenFromTokenString(refreshTokenString);

    if(!refreshToken){
        throw new UnauthorizedError("Refresh token is invalid");
    }


    const user = await getUserFromRefreshToken(refreshToken)
    if(!user){
        throw new UnauthorizedError("Refresh token's user does not exist")
    }
    const accessTokenString = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

    res.status(200).json({
        token: accessTokenString,
    })
}

export async function handlerRevoke(req: Request, res: Response){
    const refreshTokenString = getBearerToken(req);
    const result = revokeRefreshToken(refreshTokenString);
    if(!result){
        throw new UnauthorizedError("Unable to revoke refresh token");
    }
    res.status(204).send();
}