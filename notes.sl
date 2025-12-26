+   to setup the project in cwd:
    `npm init -y`

    this creates a `package.json` file

+   web framework for handling routes:
    `npm install express`

+   typescript compiler (local):
    `npm install -D typescript`

+   runs typescript files directly without compiling:
    `npm install -D ts-node`

+   auto-restarts server on file changes:
    `npm install -D nodemon`

+   typescript type definitions for node.js:
    `npm install -D @types/node`

+   typescript type definitions for express:
    `npm install -D @types/express`

+   loads environment variables from .env file:
    `npm install dotenv`

+   aws s3 client for bucket operations:
    `npm install @aws-sdk/client-s3`

+   generates signed urls for private s3 objects:
    `npm install @aws-sdk/s3-request-presigner`

+   converts time strings to milliseconds, allows me do ms("10s"):
    `npm i ms@2.1.3`
    `npm i -D @types/ms`, `-D` means it's only available in the development environment

+   to read/write music file metadata (mp3 only):
    `npm install node-id3`

+   to read music file metadata (mp3, m4a, flac, wav, ogg):
    `npm install music-metadata`

+   sqlite database
    `npm install better-sqlite3`

+   ts type definitions for `better-sqlite3`
    `npm install -D @types/better-sqlite3`

***********************************
+   in project root, create `tsconfig.json`
    copy-paste content from my google drive `G:\My Drive\0`

+   in project root, create `server.ts`

+   in `server.ts`, add:
    `
import express, { Express } from "express";

const app: Express = express();
const PORT = 5000;

// allows project to parse JSON in request body
app.use(express.json());

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})
    `

+   to start server with `npm run dev`,
    in `package.json`, go to the `scripts` tag and add:

    `
    {
        ...,
        "scripts": {
            ...,
            "dev": "nodemon server.ts"
        },
        ...
    }
    `

    `nodemon` is the command.
    `server.ts` is the relative file path

*** TAG INFO ***
+   reading tags with `music-metadata`

    `    
    import { parseFile } from "music-metadata"

    const fp = String.raw`...filepath goes here`;

    // async function because `await`
    const main = async () => {
        const metadata = await parseFile(fp);

        console.log(metadata.common.title);
        
    }

    main();
    `

+   modifying tags with `node-id3`:

    `
    import NodeID3 from "node-id3";

    const fp = String.raw`...filepath goes here`;

    NodeID3.update({
        title: '...'
    }, fp)
    `

+   writing and reading custom tag:
    
    +   writing:
        `
        import NodeID3 from "node-id3";

        const fp = "...";

        NodeID3.update({
            userDefinedText: [{
                description: "uuid",
                value: "001"
            }]
        }, fp)
        `

    +   reading:
        `
        import { parseFile } from "music-metadata";

        const fp = "..."

        const metadata = await parseFile(fp);
        const uuidValue = metadata.native["ID3v2.3"]?.find(tag => tag.id === "TXXX:uuid")?.value;
        `

        - `ID3v2.3`: metadata format version for mp3 files, use `console.log(metadata.native);` to verify version
        - `TXXX`: id3 frame type for user-defined text fields
        - `uuid`: the custom tag name you defined, format is `TXXX:<description>`