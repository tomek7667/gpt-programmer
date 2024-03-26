import { mkdirSync } from "fs";
import path from "path";
import {
	DeleteFile,
	ListDirs,
	ReadFiles,
	GetLinks,
	WriteFile,
	WriteTaskList,
	RunCommand,
	VisitLink,
} from "./actions";
import { Summarizer } from "./Summarizer";
import { config } from "../config";

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
		return WriteTaskList();
	}

	public get RunCommand() {
		return RunCommand(this.projectRoot);
	}

	public get GetLinks() {
		return GetLinks();
	}

	public get VisitLink() {
		return VisitLink();
	}

	public get summarizer() {
		return new Summarizer({
			client: config.client,
			model: config.model,
		});
	}
}

export const api = new Api();
