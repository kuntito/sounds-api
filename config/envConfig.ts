import dotenv from "dotenv";

// allows project see `process.env` on the terminal
dotenv.config();

const requiredVariables = [
    "AWS_REGION",
    "AWS_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_BUCKET_NAME",
] as const;

for (const key of requiredVariables) {
    if (!process.env[key]) {
        throw new Error(`missing environment variable: ${key}`);
    }
}

// union type of all the variables in `requiredVariables`
// it's functionally equivalent to: "AWS_REGION" | "AWS_ACCESS_KEY" | "AWS_SECRE...
type RequiredVariableKey = (typeof requiredVariables)[number];

// this allows ts to recognize `config.AWS_REGION`, `config.AWS_ACC...
type ConfigType = Record<RequiredVariableKey, string>;

export const envConfig = Object.fromEntries(
    requiredVariables.map((key) => [key, process.env[key]!])
) as ConfigType;
