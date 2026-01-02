import express from "express";
import uploadSong from "../requestHandler/uploadSong";
import getNewSongs from "../requestHandler/getNewSongs";

const songRouter = express.Router();

songRouter.post('/song', uploadSong);
songRouter.post('/new-songs', getNewSongs);

export default songRouter;