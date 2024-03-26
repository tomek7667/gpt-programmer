import { readdirSync } from "fs";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import path from "path";
import { z } from "zod";

export interface Dir {
	originalPath: string;
	path: string;
	files: string[];
}

const examples: Example[] = [
	{
		role: "user",
		content: "List all files in the src directory",
	},
	{
		role: "assistant",
		content: formatWrap(["./src/"]),
	},
	{
		role: "user",
		content: "List all files in the sandbox, current and home directories",
	},
	{
		role: "assistant",
		content: formatWrap(["./sandbox/", ".", "~/"]),
	},
];

export const ListDirs = (projectRoot: string) => {
	return new StandardAction<Dir[]>({
		type: Actions.ListDirs,
		schema: Action.Schemas.ListDirs,
		contextPath: "contexts/ListDirs",
		examples,
		action: async (paths: z.infer<typeof Action.Schemas.ListDirs>) => {
			try {
				const data: Dir[] = paths.map((p) => {
					return {
						originalPath: p,
						path: path.resolve(projectRoot, p),
						files: readdirSync(path.resolve(projectRoot, p)),
					};
				});

				return {
					data,
					message: "SUCCESS",
				};
			} catch (err: any) {
				console.log(err);
				throw new Error(err);
			}
		},
	});
};
