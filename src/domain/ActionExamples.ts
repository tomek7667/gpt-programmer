import { Role } from "./BaseAction";

export type ActionMessages = {
	[key: string]: { role: Role; content: string }[];
};

const formatWrap = (object: object): string => {
	return `{DATA}\n${JSON.stringify(object)}\n{/DATA}`;
};

export const ActionExamples: ActionMessages = {
	DeleteFile: [
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
	],
	WriteFile: [
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
	],
	ListDirs: [
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
			content:
				"List all files in the sandbox, current and home directories",
		},
		{
			role: "assistant",
			content: formatWrap(["./sandbox/", ".", "~/"]),
		},
	],
	ReadFiles: [
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
	],
};
