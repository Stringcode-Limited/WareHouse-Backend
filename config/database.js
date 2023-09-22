import mongoose from "mongoose";

export const mongoDB = async () => {
    try{
    mongoose.set("strictQuery",false);
    await mongoose.connect(process.env.DB_URL);
    console.log("Server Up and Running");
    }catch(e){
        console.log(e.message);
        process.exit(1)
    }
}