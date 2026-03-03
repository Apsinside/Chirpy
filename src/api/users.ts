import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors.js";
import { NewUser } from "../db/schema.js";
import { createUser, getUser } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash  } from "../auth.js";

type parameters = {
    password: string,
    email: string;
};

type userWithoutPassword = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response){

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


export async function handlerLoginUser(req: Request, res: Response){
    const params: parameters = req.body;
    verifyParameters(params);
    const user = await getUser(params.email);
    if(!user){
        throw new NotFoundError("User does not exist");
    }

    const result = await checkPasswordHash (params.password, user.hashedPassword)
    if(!result){
        throw new UnauthorizedError("Invalid password")
    }

    const resBody : userWithoutPassword = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }

    res.status(200).json(resBody);
}

function verifyParameters(params : { password: string, email: string; }){ 
    if(params.email.length == 0){
        throw new BadRequestError("Missing email for new user");
    }
    if(params.password.length == 0){
        throw new BadRequestError("Missing password for new user");
    }
    return params;
}
