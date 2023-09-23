import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const mongoDB = async () => {
  try {
    mongoose.set('strict', false); 
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Server Up and Running');
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
