import express, { Express } from "express";

const app: Express = express();
const PORT = 5000;

// allows project to parse JSON in request body
app.use(express.json());

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})