import { z } from "zod";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";

const examples: Example[] = [
	{
		role: "user",
		content: JSON.stringify({
			taskList: [
				{
					task: "GetLinks",
					description: "Find pocketbase documentation",
				},
				{
					task: "WriteFile",
					description: "Write {{{RESULT_0}}} to the ./links.txt file",
				},
			],
			currentTask: {
				task: "GetLinks",
				description: "Find pocketbase documentation",
			},
			currentTaskResult: {
				success: true,
				message: "Success",
				data: [
					{
						url: "https://pocketbase.io/docs",
						title: "Introduction - Docs - PocketBase",
					},
					{
						url: "https://pocketbase.io/",
						title: "PocketBase - Open Source backend in 1 file",
					},
					{
						url: "https://pocketbase.io/docs/going-to-production/",
						title: "Going to production - Docs - PocketBase",
					},
					{
						url: "https://pocketbase.io/docs/files-handling",
						title: "Files upload and handling - Docs - PocketBase",
					},
					{
						url: "https://github.com/pocketbase/pocketbase",
						title: "pocketbase/pocketbase: Open Source realtime backend in 1 file",
					},
					{
						url: "https://pocketbase.io/faq",
						title: "FAQ - PocketBase",
					},
					{
						url: "https://github.com/pocketbase/pocketbase/discussions/2345",
						title: "Can everyone access my Pocketbase on the web? #2345 - GitHub",
					},
					{
						url: "https://pocketbase.io/docs/api-collections",
						title: "Web APIs reference - API Collections - Docs - PocketBase",
					},
					{
						url: "https://pub.dev/packages/pocketbase",
						title: "pocketbase | Dart package - Pub.dev",
					},
					{
						url: "https://medium.com/@Mikepicker/build-a-multi-user-todo-list-app-with-pocketbase-in-a-single-html-file-8734bfb882fd",
						title: "Build a Multi-User Todo List App with Pocketbase in a single HTML ...",
					},
				],
			},
		}),
	},
	{
		role: "assistant",
		content: formatWrap({
			result: "ok",
			message: "",
		}),
	},
	{
		role: "user",
		content: JSON.stringify({
			taskList: [
				{
					task: "GetLinks",
					description: "Find pocketbase documentation",
				},
				{
					task: "WriteFile",
					description: "Write {{{RESULT_0}}} to the ./links.txt file",
				},
			],
			currentTask: {
				task: "WriteFile",
				description: "Write {{{RESULT_0}}} to the ./links.txt file",
			},
			currentTaskResult: {
				success: true,
				message: "Success",
				data: JSON.stringify([
					{
						outputFullPath: "/home/user/project/links.yaml",
						outputRelativePath: "./links.yaml",
					},
				]),
			},
		}),
	},
	{
		role: "assistant",
		content: formatWrap({
			result: "error",
			message:
				"Even though the task was successful, the assistant wrote a file called 'links.yaml' instead of 'links.txt' as requested by the user.",
		}),
	},
	{
		role: "user",
		content: JSON.stringify({
			taskList: [
				{
					task: "GetLinks",
					description: "Find pocketbase documentation",
				},
				{
					task: "WriteFile",
					description: "Write {{{RESULT_0}}} to the ./links.txt file",
				},
			],
			currentTask: {
				task: "WriteFile",
				description: "Write {{{RESULT_0}}} to the ./links.txt file",
			},
			currentTaskResult: {
				success: true,
				message: "Success",
				data: JSON.stringify([
					{
						outputFullPath: "/home/user/project/links.txt",
						outputRelativePath: "./links.txt",
					},
				]),
			},
		}),
	},
	{
		role: "assistant",
		content: formatWrap({
			result: "ok",
			message: "",
		}),
	},
];

export const Test = () => {
	interface TestResult {
		result: "error" | "ok";
		message: string;
	}

	return new StandardAction<TestResult>({
		type: Actions.Test,
		schema: Action.Schemas.Test,
		contextPath: "contexts/Test",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.Test>) => {
			try {
				return {
					message: "SUCCESS",
					data: content,
				};
			} catch (err: any) {
				console.log("Error: ", err);
				throw new Error(err);
			}
		},
	});
};
