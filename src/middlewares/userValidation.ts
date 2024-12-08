import { NextFunction,Request,Response } from "express";
import joi from "joi"

const authSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).alphanum().required()
});
const addUserSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required()

});


export const verifyAuthentication = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    const {error} = authSchema.validate(request.body,{abortEarly:false})
    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join()
        });
    }
    return next();
}

export const verifyEditUser = (request: Request,response: Response, next: NextFunction) => {
    const {error} = addUserSchema.validate(request.body,{abortEarly: false })

    if(error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}