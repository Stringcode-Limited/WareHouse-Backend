// cloudinaryMiddleware.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


export const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "Products",
        transformation: [{ width: 100, height: 100, crop: "limit" }]
    }
});


export const profilePictureStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "UserProfilePictures",
        transformation: [{ width: 100, height: 100, crop: "limit" }]
    }
});


