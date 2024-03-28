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
	GetTree,
	Test,
	Actions,
} from "./actions";
import { Summarizer } from "./Summarizer";
import { config } from "../config";

const now = new Date();

interface ApiCreateData {
	workDir?: string;
}

export class Api {
	public projectRoot: string;

	constructor(data: ApiCreateData = {}) {
		if (data.workDir) {
			this.projectRoot = path.resolve(data.workDir);
		} else {
			this.projectRoot = path.join(
				__dirname,
				"../../",
				"sandbox",
				`${String(now.getHours()).padStart(2, "0")}-${String(
					now.getMinutes()
				).padStart(2, "0")}-${String(now.getSeconds()).padStart(
					2,
					"0"
				)}`
			);
		}
		if (config.verbose) {
			console.log(`Api working at: ${this.projectRoot}`);
		}
		mkdirSync(this.projectRoot, { recursive: true });
	}

	public action(action: Actions) {
		const actionsDict = {
			[Actions.DeleteFile]: this.DeleteFile,
			[Actions.WriteFile]: this.WriteFile,
			[Actions.ListDirs]: this.ListDirs,
			[Actions.ReadFiles]: this.ReadFiles,
			[Actions.WriteTaskList]: this.WriteTaskList,
			[Actions.RunCommand]: this.RunCommand,
			[Actions.GetLinks]: this.GetLinks,
			[Actions.VisitLink]: this.VisitLink,
			[Actions.GetTree]: this.GetTree,
			[Actions.Test]: this.Test,
		};
		if (!actionsDict[action]) {
			throw new Error(`Action ${action} not found`);
		}
		return actionsDict[action];
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

	public get RunCommand() {
		return RunCommand(this.projectRoot);
	}

	public get GetLinks() {
		return GetLinks();
	}

	public get VisitLink() {
		return VisitLink(this);
	}

	public get GetTree() {
		return GetTree(this.projectRoot);
	}

	public get Test() {
		return Test();
	}

	public get summarizer() {
		return new Summarizer({
			client: config.client,
			model: config.model,
		});
	}
}
