import { z } from "zod";
import { StandardAction } from "./StandardAction";
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { ActionExamples } from "./ActionExamples";
import path from "path";

export enum A {
	DeleteFile = "DeleteFile",
	WriteFile = "WriteFile",
	ListDirs = "ListDirs",
}

export let AcceptedActions = [A.DeleteFile, A.WriteFile, A.ListDirs];

export const Actions = {
	Create: z.object({
		action: z.enum([A.DeleteFile, A.WriteFile, A.ListDirs]),
		message: z.string(),
	}),
	Schemas: {
		DeleteFile: z.object({
			path: z.string(),
		}),
		WriteFile: z.array(z.object({ path: z.string(), content: z.string() })),
		ListDirs: z.array(z.string()),
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
					unlinkSync(path.resolve(this.projectRoot, content.path));
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
					const data = paths.map((p) => {
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
}

export const api = new Api();
