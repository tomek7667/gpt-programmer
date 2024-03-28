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
	{
		role: "user",
		content:
			"Create a tree structure of an existing project at './example/' directory and save it to a file",
	},
	{
		role: "assistant",
		content: formatWrap([
			{
				task: "GetTree",
				description: "Current directory",
			},
			{
				task: "WriteFile",
				description:
					"Write the tree structure given in the context to 'tree_structure.yaml' file |{{{RESULT_0}}}",
			},
		]),
	},
];

export const WriteTaskList = (projectRoot: string) => {
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
						content.map((c) => c.task).join(", ")
					);
				}
				const results: string[] = [];
				const testings = new Map<number, number>();
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
					const bodyTask = {
						action: task,
						workDir: projectRoot,
						message,
					};
					const responseTask = await fetch(`${config.host}/actions`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(bodyTask),
					});
					const result: {
						success: boolean;
						message: "Success" | string;
						data?: any;
					} = (await responseTask.json()) as any;

					const messageTest = JSON.stringify({
						taskList: content,
						currentTask: content[i],
						currentTaskResult: result,
					});
					const bodyTest = {
						action: Actions.Test,
						workDir: projectRoot,
						message: messageTest,
					};
					const responseTest = await fetch(`${config.host}/actions`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(bodyTest),
					});
					const {
						data: testResultData,
						message: testResultMessage,
						success: testResultSuccess,
					}: {
						success: boolean;
						message: "Success" | string;
						data: {
							message: string;
							result: "error" | "ok";
						};
					} = (await responseTest.json()) as any;
					if (!testResultSuccess) {
						throw new Error(testResultMessage);
					}
					const t = testings.get(i);
					if (t === undefined) {
						testings.set(i, 0);
					} else {
						testings.set(i, t + 1);
						if (t > config.retryTestingNumber) {
							throw new Error(
								`The task ${task} didn't pass the test ${t} times. Investigate or increate config.retryTestingNumber (${config.retryTestingNumber}). The task will not be retried anymore. last test result message: '${testResultData.message}'. Test message: ${messageTest}`
							);
						}
					}

					if (testResultData.result === "error") {
						if (config.verbose) {
							console.log(
								`Tester did not approve the task: ${task}. The reason is: ${testResultData.message}`
							);
						}
						i = i - 1;
					} else {
						results.push(result["data"] ?? "");
					}
				}
				return {
					message: "SUCCESS",
				};
			} catch (err: any) {
				throw new Error(err);
			}
		},
	});
};
