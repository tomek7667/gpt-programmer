import OpenAI from "openai";

export const hostname = "localhost";
export const port = 3000;
export const host = `http://${hostname}:${port}`;
export const client = new OpenAI({
	baseURL: "http://localhost:1234/v1",
	apiKey: "lm-studio",
});
export const maxDepth = 15;
export const model = "deepseek-ai_deepseek-coder-6.7b-instruct";
export const verbose = false;
