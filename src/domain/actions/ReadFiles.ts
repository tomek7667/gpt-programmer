import { readFileSync } from "fs";
import { A, Actions, Example, formatWrap } from ".";
import { StandardAction } from "..";
import path from "path";
import { z } from "zod";

export interface File {
	path: string;
	content: string;
}

const examples: Example[] = [
	{
		role: "user",
		content: "Read the contents of abc.txt",
	},
	{
		role: "assistant",
		content: formatWrap(["./abc.txt"]),
	},
	{
		role: "user",
		content: "read a.txt and src/b.js.",
	},
	{
		role: "assistant",
		content: formatWrap(["./a.txt", "./src/b.js"]),
	},
];

export const ReadFiles = (projectRoot: string) => {
	return new StandardAction<File[]>({
		type: A.ReadFiles,
		schema: Actions.Schemas.ReadFiles,
		contextPath: "contexts/ReadFiles",
		examples,
		action: async (paths: z.infer<typeof Actions.Schemas.ReadFiles>) => {
			try {
				const data: File[] = paths.map((p) => {
					return {
						path: path.resolve(projectRoot, p),
						content: readFileSync(
							path.resolve(projectRoot, p),
							"utf-8"
						),
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
