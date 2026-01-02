import express from "express";
import uploadSong from "../requestHandler/uploadSong";
import getNewSongs from "../requestHandler/getNewSongs";
import deleteSong from "../requestHandler/deleteSong";

const songRouter = express.Router();

songRouter.post('/song', uploadSong);
songRouter.post('/new-songs', getNewSongs);
songRouter.delete('/:songId', deleteSong);

export default songRouter;