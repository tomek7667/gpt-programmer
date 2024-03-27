import { rmSync } from "fs";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import path from "path";
import { z } from "zod";

const examples: Example[] = [
	{
		role: "user",
		content: "Remove the file at abc/greeting.txt",
	},
	{
		role: "assistant",
		content: formatWrap({ path: "./abc/greeting.txt" }),
	},
	{
		role: "user",
		content: "Remove directory examples from the src directory",
	},
	{
		role: "assistant",
		content: formatWrap({ path: "./src/examples" }),
	},
];

export const DeleteFile = (projectRoot: string) => {
	return new StandardAction({
		type: Actions.DeleteFile,
		schema: Action.Schemas.DeleteFile,
		contextPath: "contexts/DeleteFile",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.DeleteFile>) => {
			try {
				content.forEach((p) => {
					rmSync(path.resolve(projectRoot, p), {
						recursive: true,
						force: true,
					});
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
