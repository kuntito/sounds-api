import express from "express";
import uploadSong from "../requestHandler/uploadSong";
import getNewSongs from "../requestHandler/getNewSongs";
import deleteSong from "../requestHandler/deleteSong";
import getSongsMetadata from "../requestHandler/getSongMetadata";

const songRouter = express.Router();

songRouter.post('/song', uploadSong);
songRouter.post('/new-songs', getNewSongs);
songRouter.delete('/:songId', deleteSong);
songRouter.get('/songs-md', getSongsMetadata);

export default songRouter;