import jwt from "jsonwebtoken";

export const tokenGen = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "11h"});
}

export const adminTokenGen = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

