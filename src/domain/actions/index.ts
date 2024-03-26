import { z } from "zod";
import { Role } from "../BaseAction";

export enum Actions {
	DeleteFile = "DeleteFile",
	WriteFile = "WriteFile",
	ListDirs = "ListDirs",
	ReadFiles = "ReadFiles",
	WriteTaskList = "WriteTaskList",
	RunCommand = "RunCommand",
}

export const AcceptedActions = [
	Actions.DeleteFile,
	Actions.WriteFile,
	Actions.ListDirs,
	Actions.ReadFiles,
	Actions.WriteTaskList,
	Actions.RunCommand,
];

export const formatWrap = (object: object): string => {
	return `{DATA}\n${JSON.stringify(object)}\n{/DATA}`;
};

export interface Example {
	role: Role;
	content: string;
}

const action = z.enum([
	Actions.DeleteFile,
	Actions.WriteFile,
	Actions.ListDirs,
	Actions.ReadFiles,
	Actions.WriteTaskList,
	Actions.RunCommand,
]);

export const Action = {
	Create: z.object({
		action,
		message: z.string(),
	}),
	Schemas: {
		DeleteFile: z.array(z.string()),
		WriteFile: z.array(z.object({ path: z.string(), content: z.string() })),
		ListDirs: z.array(z.string()),
		ReadFiles: z.array(z.string()),
		WriteTaskList: z.array(
			z.object({
				task: action,
				description: z.string(),
			})
		),
		RunCommand: z.object({
			command: z.string(),
			arguments: z.array(z.string()),
		}),
	},
};

export * from "./DeleteFile";
export * from "./WriteFile";
export * from "./ListDirs";
export * from "./ReadFiles";
export * from "./WriteTaskList";
export * from "./RunCommand";
