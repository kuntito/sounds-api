import { RequestHandler } from "express";
import { songMdDb } from "../services/neonDbClient";
import { songsMdTable } from "../schema/songsMd";

const getSongsMetadata: RequestHandler = async (req, res) => {
    try {
        const md = await songMdDb
            .select()
            .from(songsMdTable);

        return res
            .status(200)
            .json({
                success: true,
                message: md
            })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: `md fetch failed, ${(e as Error).message}`
            })

    }
}

export default getSongsMetadata;