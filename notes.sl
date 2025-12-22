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