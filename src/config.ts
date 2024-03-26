import OpenAI from "openai";

export const config = {
	hostname: "localhost",
	port: 3000,
	client: new OpenAI({
		baseURL: "http://localhost:1234/v1",
		apiKey: "lm-studio",
	}),
	maxDepth: 5,
	model: "mistralai_mixtral-8x7b-instruct-v0.1",
	verbose: false,
	maxTokensContextSummarizer: 30000,
	get host() {
		return `http://${this.hostname}:${this.port}`;
	},
};
