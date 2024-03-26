import { mkdirSync } from "fs";
import path from "path";
import {
	DeleteFile,
	ListDirs,
	ReadFiles,
	WriteFile,
	WriteTaskList,
} from "./actions";

const now = new Date();

export class Api {
	public projectRoot = path.join(
		__dirname,
		"../../",
		"sandbox",
		`${String(now.getHours()).padStart(2, "0")}-${String(
			now.getMinutes()
		).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`
	);

	constructor() {
		console.log("Working in:", this.projectRoot);
		mkdirSync(this.projectRoot, { recursive: true });
	}

	public get DeleteFile() {
		return DeleteFile(this.projectRoot);
	}

	public get WriteFile() {
		return WriteFile(this.projectRoot);
	}

	public get ListDirs() {
		return ListDirs(this.projectRoot);
	}

	public get ReadFiles() {
		return ReadFiles(this.projectRoot);
	}

	public get WriteTaskList() {
		return WriteTaskList(this.projectRoot);
	}
}

export const api = new Api();
