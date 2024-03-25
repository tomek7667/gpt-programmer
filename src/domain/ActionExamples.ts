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
};
