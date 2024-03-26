import OpenAI from "openai";
import { z } from "zod";
import { BaseAction as BaseAction, Role } from "./BaseAction";
import { readFileSync } from "fs";
import path from "path";
import { client, maxDepth, model, verbose } from "../config";

interface StandardActionData<K> {
	type: string;
	schema: z.ZodType<any>;
	contextPath: string;
	action: (content: any) => Promise<{ message: string; data?: K }>;
	examples: { role: Role; content: string }[];
}

const readContext = (filename: string) => {
	return readFileSync(path.join(__dirname, filename), "utf-8");
};

export class StandardAction<K = void> extends BaseAction<K> {
	constructor(data: StandardActionData<K>) {
		super({
			client,
			maxDepth,
			model,
			verbose,
			context: readContext(data.contextPath),
			...data,
		});
	}
}
