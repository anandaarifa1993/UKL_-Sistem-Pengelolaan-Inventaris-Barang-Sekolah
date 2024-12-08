// import { NextFunction,Request,Response } from "express";
// import { verify } from "jsonwebtoken";
// import { SECRET } from "../global";
// import { request } from "http";

// interface JwtPayLoad {
//     id : String;
//     name : String;
//     email : String;
//     role : String;
// }

// export const verifyToken = (req:Request, res:Response, next : NextFunction) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         return res.status(403).json({message: 'Acces denied. No token provided.'});
//     }

//     try{
//         const secretKey = SECRET || ""
//         const decoded = verify(token,secretKey);
//         req.body.user = decoded as JwtPayLoad;
//         next();
//     } catch (error) {
//         return res.status(401).json({message: 'Invalid token'});
//     }
// };

// export const verifyRole = (allowedRoles: string[]) => {
//     return (req: Request, res: Response, next:NextFunction)=>{
//         const user = req.body.user;

//         if (!user) {
//             return res.status(403).json({ message: "User not found" });
//         }
//         if (!allowedRoles.includes(user.role)){
//             return res.status(403)
//             .json({message: "You are not allowed to acces this resource"});
//         }
//         next()
//     };
// };

import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { SECRET } from "../global";

interface JwtPayLoad {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Extend Request object to include user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayLoad;
        }
    }
}

// Middleware for token verification
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secretKey = "token" ;
        if (!secretKey) {
            throw new Error("SECRET key is not defined.");
        }
        const decoded = verify(token, secretKey);
        req.user = decoded as JwtPayLoad;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware for role-based access control
export const verifyRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(403).json({ message: "Authentication required." });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: "You are not allowed to access this resource",
            });
        }

        next();
    };
};
