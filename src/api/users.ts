import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../errors.js";
import { NewUser } from "../db/schema.js";
import { createUser } from "../db/queries/users.js";

export async function handlerCreateUser(req: Request, res: Response){
    type parameters = {
        email: string;
    };

    const params: parameters = req.body;
    if(params.email.length == 0){
        throw new BadRequestError("Missing email for new user");
    }

    const user: NewUser = {email: params.email};
    const result = await createUser(user);
    if(!result){
        throw new BadRequestError("Failed to create users")
    }

    const resBody = {
        id: result.id,
        email: result.email,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
    }
    
    res.status(201).json(resBody);
}
