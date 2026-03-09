import { eq } from "drizzle-orm";
import { db } from "./../index.js";
import { NewUser, users } from "../schema.js";

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

export async function getUserByEmail(userEmail: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, userEmail))
  return result;
}

export async function getUserByID(userID: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, userID))
  return result;
}

export async function updateUser(user : NewUser){
   const [result] = await db
   .update(users)
   .set({email: user.email, hashedPassword: user.hashedPassword})
   .where(eq(users.id, user.id!))
   .returning();
   return result;
}

export async function upgradeUser(userID: string){
    const [result] = await db
   .update(users)
   .set({isChirpyRed: true })
   .where(eq(users.id, userID))
   .returning();
   return result;
}