import { randomUUID } from "crypto";
import { OpenAI } from "openai";
import { mkdirSync, writeFileSync } from "fs";
import { z } from "zod";
import path from "path";
import { SUFFIX_WARNING } from "./ActionExamples";

export interface BaseActionData {
	type: string;
	context: string;
	maxDepth: number;
	model: string;
	verbose: boolean;
	client: OpenAI;
	schema: z.ZodType<any>;
	action: (content: any) => Promise<string>;
	examples: { role: Role; content: string }[];
}

export type Role = "system" | "user" | "assistant";

export interface Message {
	id: string;
	role: Role;
	content: string;
}

export class BaseAction {
	public id: string;
	public context: string;
	public maxDepth: number;
	public model: string;
	public verbose: boolean;
	public client: OpenAI;
	public history: Message[] = [];
	public contextId: string;
	public schema: z.ZodType<any>;
	public action: (content: any) => Promise<string>;

	constructor(data: BaseActionData) {
		this.id = `${data.type}-${Math.random().toString(36).substring(2, 9)}`;
		this.context = data.context;
		this.maxDepth = data.maxDepth;
		this.model = data.model;
		this.verbose = data.verbose;
		this.client = data.client;
		this.history = [];
		this.schema = data.schema;
		this.action = data.action;

		this.contextId = randomUUID();
		this.addMessage({
			id: this.contextId,
			role: "system",
			content: `Your id is '${this.id}'.\n${this.context}`,
		});
		data.examples.forEach(({ content, role }) =>
			this.addMessage({
				content,
				role,
			})
		);

		console.log(`Created ${this.id}`);
	}

	public saveSelf(prefix = "debug") {
		mkdirSync(path.join(__dirname, `../../${prefix}/actions`), {
			recursive: true,
		});
		writeFileSync(
			path.join(__dirname, `../../${prefix}/actions/${this.id}.json`),
			JSON.stringify(
				{
					id: this.id,
					context: this.context,
					maxDepth: this.maxDepth,
					model: this.model,
					verbose: this.verbose,
					history: this.history,
					contextId: this.contextId,
				},
				null,
				2
			)
		);
	}

	public addMessage({
		id,
		role,
		content,
	}: {
		id?: string;
		role: Role;
		content: string;
	}) {
		this.history.push({
			id: id ?? randomUUID(),
			role,
			content,
		});
	}

	public async perform(
		task: string,
		role: Role = "user",
		depth: number = 0
	): Promise<void> {
		task = task + SUFFIX_WARNING;
		if (role !== "system" || task !== this.lastMessage.content) {
			this.addMessage({
				role,
				content: task,
			});
		}
		const completion = await this.client.chat.completions.create({
			messages: this.history,
			model: this.model,
		});
		completion.choices.forEach((choice) => {
			if (choice.message.content === null) {
				throw new Error(
					`INVALID_RESPONSE: ${this.id}, The response from the completion is null.`
				);
			}
			this.addMessage({
				content: choice.message.content,
				role: choice.message.role,
			});
		});

		const output = await this.determineCommand(this.lastMessage.content);
		if (this.verbose) {
			this.saveSelf();
		}
		if (depth > this.maxDepth) {
			this.saveSelf("error");
			throw new Error(
				`MAXIMUM_DEPTH_EXCEEDED: ${this.id}, Too many recursive calls, maximum recursion depth set is ${this.maxDepth}`
			);
		}
		if (output !== "SUCCESS") {
			await this.perform(output, "user", depth + 1);
		}
	}

	public async determineCommand(content: string): Promise<string> {
		try {
			if (content.trim().length === 0) {
				this.history.pop();
				// return "You have provided an empty response. Please follow the format instructed at the beginning of the conversation.";
				return `Empty response is not a correct response. Reply according with your context: '${this.context}'`;
			}
			const json = JSON.parse(content);
			const data = this.schema.parse(json);
			return await this.action(data);
		} catch (err: any) {
			const error = err?.message ?? err?.toString() ?? "Unknown error";
			if (this.verbose) {
				console.log("ERROR DURING THE COMMAND: ", {
					content,
					error,
				});
				this.saveSelf("error");
			}
			return `ERROR DURING THE COMMAND: '${error}'`;
		}
	}

	public updateContext(content: string) {
		const newContext: Message = {
			id: this.contextId,
			role: "system",
			content,
		};
		this.history[0] = newContext;
	}

	public get lastMessage() {
		return this.history[this.history.length - 1];
	}
}
