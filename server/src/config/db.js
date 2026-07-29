import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      console.log("MongoDB URI found, attempting to connect...");
      console.log(`MongoDB URI starts with: ${mongoUri.substring(0, 20)}...`);
    } else {
      console.error("MongoDB URI not found. Please set the MONGODB_URI environment variable.");
      process.exit(1);
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
