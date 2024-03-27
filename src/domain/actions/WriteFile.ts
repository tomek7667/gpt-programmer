import { mkdirSync, writeFileSync } from "fs";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import path from "path";
import { z } from "zod";
import { config } from "../../config";

const examples: Example[] = [
	{
		role: "user",
		content:
			"Create a hello world text file. You can call the file abc.txt",
	},
	{
		role: "assistant",
		content: formatWrap([{ path: "abc.txt", content: "Hello World!" }]),
	},
	{
		role: "user",
		content:
			"Make 3 files each starting with a different alphabet letter. Extension can be txt. Inside input different letters",
	},
	{
		role: "assistant",
		content: formatWrap([
			{
				path: "./a.txt",
				content: "b",
			},
			{
				path: "./b.txt",
				content: "c",
			},
			{
				path: "./c.txt",
				content: "d",
			},
		]),
	},
];

export const WriteFile = (projectRoot: string) => {
	return new StandardAction({
		type: Actions.WriteFile,
		schema: Action.Schemas.WriteFile,
		contextPath: "contexts/WriteFile",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.WriteFile>) => {
			try {
				content.map(({ content, path: p }) => {
					if (p[p.length - 1] === "/") {
						mkdirSync(path.resolve(projectRoot, p), {
							recursive: true,
						});
					} else {
						const dir = path.resolve(
							p.split("/").slice(0, -1).join("/")
						);
						if (dir !== "" && dir !== ".") {
							if (config.verbose) {
								console.log(
									`WriteFile: creating directory ${dir}`
								);
							}
							mkdirSync(dir, { recursive: true });
						}
						const finalPath = path.resolve(projectRoot, p);
						if (config.verbose) {
							console.log(
								`WriteFile: writing to file ${finalPath} (${content.length} bytes)`
							);
						}
						writeFileSync(finalPath, content, {
							encoding: "utf-8",
						});
					}
				});
				return {
					message: "SUCCESS",
				};
			} catch (err: any) {
				// TODO: Call InformBot action to inform the bot of the error. For now process.exit(1) will do.
				throw new Error(err);
			}
		},
	});
};
