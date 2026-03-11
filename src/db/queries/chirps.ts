import { asc, eq, desc } from "drizzle-orm";
import { db } from "./../index.js";
import { Chirp, chirps } from "../schema.js";

export async function createChirp(chirp: Chirp){
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps(sortDesc: boolean, authorId?: string, ){
  const result = await db
    .select()
    .from(chirps)
    .where(authorId ? eq(chirps.userId, authorId ) : undefined)
    .orderBy(sortDesc ? desc(chirps.createdAt) :  asc(chirps.createdAt));
   return result;
}

export async function getChirp(chirpId: string){
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
   return result;
}

export async function getChirpsByAuthorId(authorId: string){
  const result = await db
  .select()
  .from(chirps)
  .where(eq(chirps.userId, authorId));
  return result;
}

export async function deleteChirp(chirpId: string) {
  const [result] = await db
  .delete(chirps)
  .where(eq(chirps.id, chirpId))
  .returning();
  return result;
}