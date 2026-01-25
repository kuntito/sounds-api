import express from "express";
import multer from "multer";
import uploadSong from "../requestHandler/uploadSong";
import getNewSongs from "../requestHandler/getNewSongs";
import deleteSong from "../requestHandler/deleteSong";
import getSongsMetadata from "../requestHandler/getSongMetadata";

const songRouter = express.Router();

// files are sent as bytes in the request body
// `multer` extracts these bytes and reconstructs the file in 'temp-uploads/' 
// `uploadSong` then reads, processes, and deletes these temp files
const upload = multer({ dest: 'temp-uploads/'});
songRouter.post('/song', upload.single('audio'), uploadSong);

songRouter.post('/new-songs', getNewSongs);
songRouter.delete('/:songId', deleteSong);
songRouter.get('/songs-md', getSongsMetadata);

export default songRouter;