import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("MongoDB URI not found. Please set the MONGODB_URI environment variable.");
      throw new Error("MongoDB URI not found. Please set the MONGODB_URI environment variable.");
    }
    
    console.log("Creating new database connection");
    cached.promise = mongoose.connect(mongoUri, { bufferCommands: false }).then((mongoose) => {
      console.log("Database connection successful");
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
