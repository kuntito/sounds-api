import express from "express";
import getSongs from "../requestHandler/getSongs";

const songRouter = express.Router();

songRouter.get('/', getSongs);

export default songRouter;