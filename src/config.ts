import OpenAI from "openai";

export const config = {
	hostname: "localhost",
	port: 3000,
	client: new OpenAI({
		baseURL: "http://localhost:1234/v1",
		apiKey: "lm-studio",
	}),
	maxDepth: 15,
	// TheBloke/Mistral-7B-Instruct-v0.2-GGUF/mistral-7b-instruct-v0.2.Q4_K_S.gguf
	model: "mistralai_mistral-7b-instruct-v0.2",
	verbose: false,
	performRegression: false,
	retryRegressionNumber: 5,
	maxTokensContextSummarizer: 30000,
	get host() {
		return `http://${this.hostname}:${this.port}`;
	},
};
