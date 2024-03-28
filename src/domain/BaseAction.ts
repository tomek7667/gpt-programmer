import { randomUUID } from "crypto";
import { OpenAI } from "openai";
import { mkdirSync, writeFileSync } from "fs";
import { z } from "zod";
import path from "path";

export interface BaseActionData<K> {
	type: string;
	context: string;
	maxDepth: number;
	model: string;
	verbose: boolean;
	client: OpenAI;
	schema: z.ZodType<any>;
	action: (content: any) => Promise<{ message: string; data?: K }>;
	examples: { role: Role; content: string }[];
}

export type Role = "system" | "user" | "assistant";

export interface Message {
	id: string;
	role: Role;
	content: string;
}

export class BaseAction<K = void> {
	public id: string;
	public context: string;
	public maxDepth: number;
	public model: string;
	public verbose: boolean;
	public client: OpenAI;
	public history: Message[] = [];
	public contextId: string;
	public schema: z.ZodType<any>;
	public action: (content: any) => Promise<{ message: string; data?: K }>;

	constructor(data: BaseActionData<K>) {
		this.id = `${data.type}-${Math.random()
			.toString(36)
			.substring(2, 9)
			.toUpperCase()}`;
		this.context = data.context;
		this.maxDepth = data.maxDepth;
		this.model = data.model;
		this.verbose = data.verbose;
		this.client = data.client;
		this.history = [];
		this.schema = data.schema;
		this.action = data.action;

		this.contextId = randomUUID();
		this.pushMessage({
			id: this.contextId,
			role: "system",
			content: `Your id is '${this.id}'.\n${this.context}`,
		});
		data.examples.forEach(({ content, role }) =>
			this.pushMessage({
				content,
				role,
			})
		);
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

	public pushMessage({
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

	public unshiftMessage({
		id,
		role,
		content,
	}: {
		id?: string;
		role: Role;
		content: string;
	}) {
		this.history.unshift({
			id: id ?? randomUUID(),
			role,
			content,
		});
	}

	public async perform(
		task: string,
		role: Role = "user",
		depth: number = 0
	): Promise<K | void> {
		const [message, ...contexts] = task.split("|");
		if (contexts.length > 0) {
			const context = contexts.join("|");
			this.unshiftMessage({
				role: "system",
				content: context,
			});
		}
		if (role !== "system" || message !== this.lastMessage.content) {
			this.pushMessage({
				role,
				content: message,
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
			this.pushMessage({
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
		if (output.message !== "SUCCESS") {
			if (this.verbose) {
				console.log(output);
			}
			// pop the last message
			// // TODO: This should be somehow different. Still IMO it's better to inform the model where it is failing
			// this.history.pop();
			return await this.perform(output.message, "user", depth + 1);
		}
		return output.data;
	}

	public async determineCommand(
		content: string
	): Promise<{ data?: K; message: string }> {
		try {
			content = this.dewrapText(content);
			if (content.trim().length === 0) {
				this.history.pop();
				return {
					message: `Empty response is not a correct response. Reply according with your context: '${this.context}'`,
				};
			}
			const json = JSON.parse(content);
			const model = this.schema.parse(json);
			return await this.action(model);
		} catch (err: any) {
			const error = err?.message ?? err?.toString() ?? "Unknown error";
			if (this.verbose) {
				console.log(`ERROR DURING THE COMMAND (${this.id}): `, {
					content,
					error,
				});
				this.saveSelf("error");
			}
			return {
				message: `Incorrect format detected. Please follow the format instructed at the beginning of the conversation. Error: ${error}`,
			};
		}
	}

	public updateContext(content: string) {
		this.history[0].content = content;
		this.unshiftMessage({
			id: this.contextId,
			role: "system",
			content,
		});
	}

	public get lastMessage() {
		return this.history[this.history.length - 1];
	}

	private dewrapText(text: string): string {
		const match = text.match(/\{DATA\}(.+)\{\/DATA\}/s);
		if (match) {
			return match[1].trim();
		}
		return text;
	}
}
