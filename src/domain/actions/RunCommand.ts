import { z } from "zod";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import { spawnSync } from "child_process";
import { appendFileSync } from "fs";
import path from "path";

const examples: Example[] = [
	{
		role: "user",
		content: "run the main.py script",
	},
	{
		role: "assistant",
		content: formatWrap({
			command: "python",
			arguments: ["main.py"],
		}),
	},
	{
		role: "user",
		content:
			"Write a command that will print out ram memory usage on the system (linux like)",
	},
	{
		role: "assistant",
		content: formatWrap({
			command: "free",
			arguments: ["-h"],
		}),
	},
	{
		role: "user",
		content:
			"Write a command that will print out ram memory usage on the system (windows like)",
	},
	{
		role: "assistant",
		content: formatWrap({
			command: `systeminfo | findstr /C:"Total Physical Memory" /C:"Available Physical Memory"`,
			arguments: [],
		}),
	},
];

export interface CommandOutput {
	stdout: string;
	stderr: string;
	error: string;
}

export const RunCommand = (projectRoot: string) => {
	return new StandardAction<CommandOutput>({
		type: Actions.RunCommand,
		schema: Action.Schemas.RunCommand,
		contextPath: "contexts/RunCommand",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.RunCommand>) => {
			try {
				const { stdout, stderr, error } = spawnSync(
					content.command,
					content.arguments,
					{
						cwd: projectRoot,
						shell: true,
					}
				);
				const data = {
					stdout: stdout.toString(),
					stderr: stderr.toString(),
					error: error?.message ?? error?.toString() ?? "",
				};
				appendFileSync(
					path.resolve(projectRoot, "output.log"),
					JSON.stringify(data, null, 4)
				);
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
