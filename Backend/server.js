import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv"

// Load environment variables
dotenv.config({
    path: process.env.NODE_ENV === 'production' ? './.env' : './env'
})

connectDB()
  .then(() => {
    const port = process.env.PORT || 9000;
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${port}/api/v1`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
