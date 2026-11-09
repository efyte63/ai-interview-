import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
export function connectdb()
{
    try {
        mongoose.connect(process.env.db_connection);
        return "connected";
    } catch (error) {
        console.log(error);
    }
}