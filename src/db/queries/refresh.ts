import { ref } from "node:process";
import {db} from "../index.js"
import { RefreshToken, refreshTokens, users } from "../schema.js"
import {eq, isNull, and, gt} from "drizzle-orm"

export async function createRefreshToken(token: RefreshToken){
    const [result] = await db
    .insert(refreshTokens)
    .values(token)
    .onConflictDoNothing()
    .returning();
    return result;
}

export async function getRefreshTokenFromTokenString(tokenString: string) {
    const [result] = await db
        .select()
        .from(refreshTokens)
        .where(
            and(
                eq(refreshTokens.token, tokenString),
                isNull(refreshTokens.revokedAt),
                gt(refreshTokens.expiresAt, new Date())
            )
        );
    return result;
}

export async function getUserFromRefreshToken(token: RefreshToken){
    const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, token.userID));
    return result;
}


export async function revokeRefreshToken(tokenString: string){
    const [result] = await db
    .update(refreshTokens)
    .set({revokedAt: new Date(), updatedAt: new Date()})
    .where(eq(refreshTokens.token, tokenString));
    return result;
}