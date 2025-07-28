import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import todoRoute from "../backend/routes/todo.route.js";
import userRoute from "../backend/routes/user.route.js";
import cookieParser from "cookie-parser";
const app = express();

 
const PORT = process.env.PORT || 4003;
const DB_URI = "mongodb://localhost:27017/todo-app";

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"], // Add other headers you want to allow here.
  })
);

// Database connection code

console.log("MONGODB_URI =", process.env.MONGODB_URI); 
try {
  await mongoose.connect(DB_URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log(error);
}

// routes
app.use("/todo", todoRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
