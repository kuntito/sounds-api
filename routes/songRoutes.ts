import express from "express";
import uploadSong from "../requestHandler/uploadSong";

const songRouter = express.Router();

songRouter.post('/song', uploadSong);

export default songRouter;