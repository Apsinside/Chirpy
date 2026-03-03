import { db } from "./index.js";
import { Chirp, chirps, NewUser, users } from "./schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function resetUsers() {
  await db.delete(users);
}


export async function createChirp(chirp: Chirp){
  const [result] = await db
  .insert(chirps)
  .values(chirp)
  .onConflictDoNothing()
  .returning();
  return result;
}