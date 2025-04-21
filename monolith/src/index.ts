import express, { json, Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors'
import router from "./routes";
dotenv.config();
const app = express();
app.use(cors())
app.use(json())
const PORT = process.env.PORT;

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

app.use("/api", router)
app.listen(PORT, () => {
  console.log("Serever running at PORT: ", PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});