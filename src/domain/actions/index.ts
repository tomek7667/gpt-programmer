import { z } from "zod";
import { Role } from "../BaseAction";

export enum A {
	DeleteFile = "DeleteFile",
	WriteFile = "WriteFile",
	ListDirs = "ListDirs",
	ReadFiles = "ReadFiles",
	WriteTaskList = "WriteTaskList",
}

export const AcceptedActions = [
	A.DeleteFile,
	A.WriteFile,
	A.ListDirs,
	A.ReadFiles,
	A.WriteTaskList,
];

export const formatWrap = (object: object): string => {
	return `{DATA}\n${JSON.stringify(object)}\n{/DATA}`;
};

export interface Example {
	role: Role;
	content: string;
}

const action = z.enum([
	A.DeleteFile,
	A.WriteFile,
	A.ListDirs,
	A.ReadFiles,
	A.WriteTaskList,
]);

export const Actions = {
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
	},
};

export * from "./DeleteFile";
export * from "./WriteFile";
export * from "./ListDirs";
export * from "./ReadFiles";
export * from "./WriteTaskList";
