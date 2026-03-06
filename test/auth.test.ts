import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash, getBearerToken } from "../src/auth.js";
import { Request } from "express";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
    it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});


describe("JWT", () => {
  const userID = "e2a1b8dd-ae48-4010-a912-c00386104aa0";
  const secret1 = "super-secret-test-key"; 
  const secret2 = "another-secrect-test-key";
  let token1: string;
  let token2: string;

  beforeAll(async () => {
    token1 = makeJWT(userID, 1, secret1);
    token2 = makeJWT(userID, -1, secret2);
  });

  it("should return true for the correct secret", async () => {
    const result = validateJWT(token1, secret1);
    expect(result).toEqual(userID);
  });
  it("should return false for the wrong secret", async () => {
    expect(() => validateJWT(token1, secret2)).toThrowError();
  });
  it("should throw error for expired token", async() => {
    expect(() => validateJWT(token2, secret2)).toThrow();
  });
  it("should return true for correct token from auth header", async() => {
    const mockRequest = {
        get: (name: string) => {
        if (name === "Authorization") {
            return "Bearer my-secret-token";
        }
        return undefined;
        }
    } as Request; // We cast it to Request so TypeScript is happy

    const token = getBearerToken(mockRequest);
    expect(token).toEqual("my-secret-token");
   });
   it("should throw for missing token from auth header", async() => {
    const mockRequest = {
        get: (name: string) => {
        if (name === "Authorization") {
            return "Bearer";
        }
        return undefined;
        }
    } as Request; // We cast it to Request so TypeScript is happy

    expect(() => getBearerToken(mockRequest)).toThrow();
   });
    it("should throw for missing auth header", async() => {
    const mockRequest = {
        get: (name: string) => {
            return undefined;
        }
    } as Request; // We cast it to Request so TypeScript is happy

    expect(() => getBearerToken(mockRequest)).toThrow();
   });
});