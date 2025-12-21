import { Request, Response, RequestHandler } from "express";

const getSongs: RequestHandler = async (
    req: Request,
    res: Response
) => {
    const songs: string[] = ["omah lay"];

    return res.status(200).json({
        success: true,
        data: songs
    })
}

export default getSongs;