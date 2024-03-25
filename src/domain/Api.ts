import { z } from "zod";
import { StandardAction } from "./StandardAction";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { ActionExamples } from "./ActionExamples";

export enum A {
	DeleteFile = "DeleteFile",
	WriteFile = "WriteFile",
}

export let AcceptedActions = [A.DeleteFile, A.WriteFile];

export const Actions = {
	Create: z.object({
		action: z.enum([A.DeleteFile, A.WriteFile]),
		message: z.string(),
	}),
	Schemas: {
		DeleteFile: z.object({
			path: z.string(),
		}),
		WriteFile: z.array(z.object({ path: z.string(), content: z.string() })),
	},
};

class Api {
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
					unlinkSync(content.path);
					return "SUCCESS";
				} catch (err: any) {
					// TODO: Call InformBot action to inform the bot of the error. For now process.exit(1) will do.
					console.error(err);
					process.exit(1);
				}
			},
		});
	}

	public get WriteFile() {
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
						const dir = p.split("/").slice(0, -1).join("/");
						console.log("creating dir", dir);
						if (dir !== "") {
							mkdirSync(dir, { recursive: true });
						}
						writeFileSync(p, content, { encoding: "utf-8" });
					});
					return "SUCCESS";
				} catch (err: any) {
					// TODO: Call InformBot action to inform the bot of the error. For now process.exit(1) will do.
					console.error(err);
					process.exit(1);
				}
			},
		});
	}
}

export const api = new Api();
