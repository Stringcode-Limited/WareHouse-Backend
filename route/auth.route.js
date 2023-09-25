import express from 'express';
import multer from 'multer';
import { isAdmin } from './../middleware/admin.js';
import { loggedIn } from './../middleware/loginAccess.js';
import { AdminLogIn, RegisterAdmin, updatePassword, updateUser, uploadProfilePicture } from '../controller/auth.controller.js';
import { profilePictureStorage }  from '../config/cloudinary.js';

const adminRouter = express.Router();
const profilePictureUpload = multer({ storage: profilePictureStorage });

adminRouter.post('/Register', RegisterAdmin);

adminRouter.get('/Login', AdminLogIn);

adminRouter.put('/update-password', isAdmin, loggedIn, updatePassword);

adminRouter.post('/profile-picture', profilePictureUpload.single('profileImage'), uploadProfilePicture);

adminRouter.put('/update-profile', isAdmin, loggedIn, updateUser);



export default adminRouter;
