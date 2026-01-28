import { songsMdTable } from "../schema/songsMd";
import { songMdDb } from "../services/neonDbClient";

const getAllSongIds = async (): Promise<string[] | undefined> => {

    try {
        const result = await songMdDb
            .select({ id: songsMdTable.id })
            .from(songsMdTable);
        const idsArray = result.map((row) => row.id);

        return idsArray;
    } catch (e) {
        console.log(`couldn't get all song ids, ${(e as Error).message}`);
        return undefined;
    }
};

export default getAllSongIds;