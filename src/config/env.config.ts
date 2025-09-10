import dotenv from "dotenv";
dotenv.config();

export const connString =
    process.env.DB_Conn_String || "mongodb://localhost:27017/notelink";

export const PORT = process.env.PORT || 5000;

export const secret = process.env.SECRET as string;

export const myGmail = process.env.EMAIL;

export const appPassword = process.env.APP_PW;
