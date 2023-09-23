import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";


dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    cloud_key: process.env.CLOUD_API_KEY,
    cloud_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ["jpg", "png", "gif", "svg", "jpeg"],
    params:{
        folder: "Warehouse",
        transformation:[{width: 100, height: 100, crop: "limit"}]
    }
})

export default storage