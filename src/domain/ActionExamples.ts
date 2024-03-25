import { Role } from "./BaseAction";

export const SUFFIX_WARNING =
	" Do not add any comments to your response. Anything beside JSON will be error.";

export type ActionMessages = {
	[key: string]: { role: Role; content: string }[];
};

export const ActionExamples: ActionMessages = {
	DeleteFile: [
		{
			role: "user",
			content: "Remove the file at abc/greeting.txt" + SUFFIX_WARNING,
		},
		{
			role: "assistant",
			content: JSON.stringify({ path: "./abc/greeting.txt" }),
		},
		{
			role: "user",
			content:
				"Remove directory examples from the src directory" +
				SUFFIX_WARNING,
		},
		{
			role: "assistant",
			content: JSON.stringify({ path: "./src/examples" }),
		},
	],
	WriteFile: [
		{
			role: "user",
			content:
				"Create a hello world text file. You can call the file abc.txt" +
				SUFFIX_WARNING,
		},
		{
			role: "assistant",
			content: JSON.stringify([
				{ path: "abc.txt", content: "Hello World!" },
			]),
		},
		{
			role: "user",
			content:
				"Make 3 files each starting with a different alphabet letter. Extension can be txt. Inside input different letters" +
				SUFFIX_WARNING,
		},
		{
			role: "assistant",
			content: JSON.stringify([
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
};
