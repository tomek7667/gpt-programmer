import fs from "fs";
import { stringify } from "yaml";
import { z } from "zod";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";
import { config } from "../..";
import path from "path";

export interface Tree {
	tree: string;
}

const examples: Example[] = [
	{
		role: "user",
		content: "the dir is .",
	},
	{
		role: "assistant",
		content: formatWrap({
			path: ".",
		}),
	},
	{
		role: "user",
		content: "path abc/ should",
	},
	{
		role: "assistant",
		content: formatWrap({
			path: "./abc/",
		}),
	},
];

const walk = (dir: string, tree: any = {}) => {
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		tree[file] = {};
		if (
			fs.statSync(`${dir}/${file}`).isDirectory() &&
			!config.getTreeIgnore.includes(file)
		) {
			walk(`${dir}/${file}`, tree[file]);
		}
	});
	return tree;
};

export const GetTree = (projectRoot: string) => {
	return new StandardAction<Tree>({
		type: Actions.GetTree,
		schema: Action.Schemas.GetTree,
		contextPath: "contexts/GetTree",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.GetTree>) => {
			try {
				const { path: treePath } = content;
				const pathToWalk = path.resolve(projectRoot, treePath);
				const treeObject = walk(pathToWalk);
				const tree = stringify(treeObject);
				return {
					data: {
						tree,
					},
					message: "SUCCESS",
				};
			} catch (err: any) {
				throw new Error(err);
			}
		},
	});
};
