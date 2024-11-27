import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
      try {
      const conn = await mongoose.connect(process.env.POST_SERVICE_DB_URL);
        console.log(`MongoDB connected:${conn.connection.host}`);
      } catch (error) {
        console.error("MongoDB Connection Failed", error.message);
        process.exit(1); 
      }
    };

export {
      connectDB
}    