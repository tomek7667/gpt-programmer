import OpenAI from "openai";
import path from "path";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { Message, Role } from "./BaseAction";
import { config } from "../config";

interface SummarizerData {
	model: string;
	client: OpenAI;
}

const readContext = (filename: string) => {
	return readFileSync(path.join(__dirname, filename), "utf-8");
};

export class Summarizer {
	public context: string;
	public history: Message[] = [];
	public model: string;
	public client: OpenAI;

	public summary: string = "";
	public summaryId: string = "";

	constructor(data: SummarizerData) {
		this.context = readContext("contexts/Summarizer");
		this.model = data.model;
		this.client = data.client;
	}

	public async summarize(text: string): Promise<string> {
		const parts: string[] = [];
		for (
			let i = 0;
			i < text.length;
			i += config.maxTokensContextSummarizer
		) {
			parts.push(text.slice(i, i + config.maxTokensContextSummarizer));
		}
		const maximumPart = parts.length;
		const maxTokensContext = Math.floor(config.maxTokensContextSummarizer / maximumPart);
		if (config.verbose) {
			console.log(`summarizePart: ${maxTokensContext} tokens per part`);
		}
		for (let i = 0; i < parts.length; i++) {
			const currentPart = i + 1;
			if (config.verbose) {
				console.log(`summarize: Part ${currentPart}/${maximumPart}`);
			}
			const part = parts[i];
			await this.summarizePart(part, currentPart, maximumPart, maxTokensContext);
		}
		return this.summary;
	}

	public async summarizePart(
		text: string,
		currentPart: number,
		maximumPart: number,
		maxTokensContext: number
	): Promise<void> {
		this.history = [];
		const context = this.context.replaceAll(
			"{{{MAX_TOKENS_CONTEXT}}}",
			String(maxTokensContext)
		);
		this.pushMessage({
			role: "system",
			content: context,
		});

		const content = `\`\`\`html\n${text}\n\`\`\`The above text is only a part of the whole document. It's ${currentPart}/${maximumPart} part, and whatever you will write, will be added to the summary.`;
		this.pushMessage({
			content,
		});
		const completion = await this.client.chat.completions.create({
			messages: this.history,
			model: this.model,
		});
		const message = completion.choices[0].message.content;
		if (!message) {
			throw new Error("summarize: No completion message");
		}
		this.summary += message;
	}

	public pushMessage({
		id,
		role,
		content,
	}: {
		id?: string;
		role?: Role;
		content: string;
	}) {
		this.history.push({
			id: id ?? randomUUID(),
			role: role ?? "user",
			content,
		});
	}

	public get lastMessage() {
		return this.history[this.history.length - 1];
	}
}
