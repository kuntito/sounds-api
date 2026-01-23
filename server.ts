import "./config/envConfig"; // validates environment variables
import express, { Express } from "express";
import songRouter from "./routes/songRoutes";
import cors from 'cors';

const app: Express = express();
const PORT = 5000;

// allows project to parse JSON in request body
app.use(express.json());

// enable CORS for all origins
app.use(cors());

app.use("/api/sounds", songRouter);

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});

