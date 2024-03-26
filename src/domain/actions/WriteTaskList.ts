import { stringify } from "yaml";
import { z } from "zod";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import { config } from "../../config";

const examples: Example[] = [
	{
		role: "user",
		content: "Create helloworld.txt file with 'abcdef' as content",
	},
	{
		role: "assistant",
		content: formatWrap([
			{
				task: "WriteFile",
				description:
					"Create a 'helloworld.txt' with 'abcdef' as content",
			},
		]),
	},
	{
		role: "user",
		content:
			"Create helloworld.txt file, read its contents, save the result to 2.txt file and then remove the original, 'helloworld.txt' file. The original file should contain 'abcdef' inside it (before it's deleted of course)",
	},
	{
		role: "assistant",
		content: formatWrap([
			{
				task: "WriteFile",
				description:
					"Create a 'helloworld.txt' with 'abcdef' as content",
			},
			{
				task: "ReadFiles",
				description: "Read the contents of the ./helloworld.txt file",
			},
			{
				task: "WriteFile",
				description: "Write {{{RESULT_1}}} to the ./2.txt file",
			},
			{
				task: "DeleteFile",
				description: "Remove the ./helloworld.txt file",
			},
		]),
	},
	{
		role: "user",
		content:
			"Save links of pocketbase documentation to a file called links.txt",
	},
	{
		role: "assistant",
		content: formatWrap([
			{
				task: "GetLinks",
				description: "Find pocketbase documentation",
			},
			{
				task: "WriteFile",
				description: "Write {{{RESULT_0}}} to the ./links.txt file",
			},
		]),
	},
];

export const WriteTaskList = () => {
	return new StandardAction({
		type: Actions.WriteTaskList,
		schema: Action.Schemas.WriteTaskList,
		contextPath: "contexts/WriteTaskList",
		examples,
		action: async (
			content: z.infer<typeof Action.Schemas.WriteTaskList>
		) => {
			try {
				if (config.verbose) {
					console.log(
						"A plan to execute the tasks: ",
						content
							.map(
								({ task, description }) =>
									`"${task}":"${description}"`
							)
							.join(", ")
					);
				} else {
					console.log(
						"A plan to execute the tasks: ",
						content.map((c) => c.task).join(", ")
					);
				}
				const results: string[] = [];

				// Unfortunately, a traditional for loop is required here to perform the tasks synchronously
				for (let i = 0; i < content.length; i++) {
					const { task, description } = content[i];
					let message = description;
					results.forEach((result, index) => {
						message = message.replaceAll(
							`{{{RESULT_${index}}}}`,
							`YAML>>>${stringify(result)}<<<YAML`
						);
					});

					const response = await fetch(`${config.host}/actions`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							action: task,
							message,
						}),
					});
					const result: any = await response.json();
					// TODO: Request to a tester to verify whether the result is according to the description of the task.
					results.push(result["data"] ?? "");
				}
				return {
					message: "SUCCESS",
				};
			} catch (err: any) {
				console.error(err);
				throw new Error(err);
			}
		},
	});
};
