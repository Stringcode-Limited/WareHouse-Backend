import jwt from "jsonwebtoken";
const tokenGen = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "3h"});
}

export default tokenGen