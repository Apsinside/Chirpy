import * as argon2 from "argon2";

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