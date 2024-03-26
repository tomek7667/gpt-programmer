import OpenAI from "openai";

export const config = {
	hostname: "localhost",
	port: 3000,
	client: new OpenAI({
		baseURL: "http://localhost:1234/v1",
		apiKey: "lm-studio",
	}),
	maxDepth: 15,
	model: "deepseek-ai_deepseek-coder-6.7b-instruct",
	verbose: false,
	get host() {
		return `http://${this.hostname}:${this.port}`;
	},
};
