import jwt from "jsonwebtoken";

export const tokenGen = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "3h"});
}

export const adminTokenGen = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "365d"});
}

