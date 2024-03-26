import { z } from "zod";
import { StandardAction } from "./StandardAction";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmdirSync,
	rmSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import { ActionExamples } from "./ActionExamples";
import path from "path";
import { host } from "../config";

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

const now = new Date();

class Api {
	public projectRoot = path.join(
		__dirname,
		"../../",
		"sandbox",
		`${String(now.getHours()).padStart(2, "0")}-${String(
			now.getMinutes()
		).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`
	);

	constructor() {
		console.log("Project root: ", this.projectRoot);
	}

	public get DeleteFile() {
		return new StandardAction({
			type: A.DeleteFile,
			schema: Actions.Schemas.DeleteFile,
			contextPath: "actions/DeleteFile",
			examples: ActionExamples.DeleteFile,
			action: async (
				content: z.infer<typeof Actions.Schemas.DeleteFile>
			) => {
				try {
					content.forEach((p) => {
						rmSync(path.resolve(this.projectRoot, p), {
							recursive: true,
							force: true,
						});
					});
					return {
						message: "SUCCESS",
					};
				} catch (err: any) {
					// TODO: Call InformBot action to inform the bot of the error. For now process.exit(1) will do.
					console.error(err);
					throw new Error(err);
				}
			},
		});
	}

	public get WriteFile() {
		mkdirSync(this.projectRoot, { recursive: true });
		return new StandardAction({
			type: A.WriteFile,
			schema: Actions.Schemas.WriteFile,
			contextPath: "actions/WriteFile",
			examples: ActionExamples.WriteFile,
			action: async (
				content: z.infer<typeof Actions.Schemas.WriteFile>
			) => {
				try {
					content.map(({ content, path: p }) => {
						if (p[p.length - 1] === "/") {
							mkdirSync(path.resolve(this.projectRoot, p), {
								recursive: true,
							});
						} else {
							const dir = path.resolve(
								p.split("/").slice(0, -1).join("/")
							);
							if (dir !== "" && dir !== ".") {
								mkdirSync(dir, { recursive: true });
							}
							writeFileSync(
								path.resolve(this.projectRoot, p),
								content,
								{
									encoding: "utf-8",
								}
							);
						}
					});
					return {
						message: "SUCCESS",
					};
				} catch (err: any) {
					// TODO: Call InformBot action to inform the bot of the error. For now process.exit(1) will do.
					console.error(err);
					throw new Error(err);
				}
			},
		});
	}

	public get ListDirs() {
		interface Dir {
			originalPath: string;
			path: string;
			files: string[];
		}

		return new StandardAction<Dir[]>({
			type: A.ListDirs,
			schema: Actions.Schemas.ListDirs,
			contextPath: "actions/ListDirs",
			examples: ActionExamples.ListDirs,
			action: async (paths: z.infer<typeof Actions.Schemas.ListDirs>) => {
				try {
					const data: Dir[] = paths.map((p) => {
						return {
							originalPath: p,
							path: path.resolve(this.projectRoot, p),
							files: readdirSync(
								path.resolve(this.projectRoot, p)
							),
						};
					});

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
	}

	public get ReadFiles() {
		interface File {
			path: string;
			content: string;
		}

		return new StandardAction<File[]>({
			type: A.ReadFiles,
			schema: Actions.Schemas.ReadFiles,
			contextPath: "actions/ReadFiles",
			examples: ActionExamples.ReadFiles,
			action: async (
				paths: z.infer<typeof Actions.Schemas.ReadFiles>
			) => {
				try {
					const data: File[] = paths.map((p) => {
						return {
							path: path.resolve(this.projectRoot, p),
							content: readFileSync(
								path.resolve(this.projectRoot, p),
								"utf-8"
							),
						};
					});

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
	}

	public get WriteTaskList() {
		return new StandardAction({
			type: A.WriteTaskList,
			schema: Actions.Schemas.WriteTaskList,
			contextPath: "actions/WriteTaskList",
			examples: ActionExamples.WriteTaskList,
			action: async (
				content: z.infer<typeof Actions.Schemas.WriteTaskList>
			) => {
				try {
					const results: string[] = [];
					// Unfortunately, a traditional for loop is required here to perform the tasks synchronously
					for (let i = 0; i < content.length; i++) {
						const { task, description } = content[i];
						let message = description;
						results.forEach((result, index) => {
							message = message.replaceAll(
								`{{{RESULT_${index}}}}`,
								result
							);
						});

						const response = await fetch(`${host}/actions`, {
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
	}
}

export const api = new Api();
