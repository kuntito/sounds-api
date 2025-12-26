import express from "express";
import getSongs from "../requestHandler/getSongs";
import uploadSong from "../requestHandler/uploadSong";

const songRouter = express.Router();

songRouter.get('/songs', getSongs);
songRouter.post('/song', uploadSong);

export default songRouter;