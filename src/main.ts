import { z } from "zod";
import bodyParser from "body-parser";
import express from "express";
import { Action, Actions, AcceptedActions, Api } from "./domain";
import { config } from ".";

const app = express();

app.use(bodyParser.json());

app.post("/actions", async (req, res) => {
	try {
		const parsed = Action.Create.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json(parsed);
			return;
		}
		const data: z.infer<typeof Action.Create> = parsed.data;
		const api = new Api(data);
		switch (data.action) {
			case Actions.DeleteFile: {
				await api.DeleteFile.perform(data.message);
				break;
			}
			case Actions.WriteFile: {
				await api.WriteFile.perform(data.message);
				break;
			}
			case Actions.ListDirs: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.ListDirs.perform(data.message),
				});
			}
			case Actions.ReadFiles: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.ReadFiles.perform(data.message),
				});
			}
			case Actions.WriteTaskList: {
				await api.WriteTaskList.perform(data.message);
				break;
			}
			case Actions.RunCommand: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.RunCommand.perform(data.message),
				});
			}
			case Actions.GetLinks: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.GetLinks.perform(data.message),
				});
			}
			case Actions.VisitLink: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.VisitLink.perform(data.message),
				});
			}
			case Actions.GetTree: {
				return res.status(200).json({
					success: true,
					message: "Success",
					data: await api.GetTree.perform(data.message),
				});
			}
			default: {
				return res.status(400).json({
					success: false,
					message: `Unknown action: ${data.action}. AcceptedActions: ${AcceptedActions}`,
				});
			}
		}

		return res.status(200).json({
			success: true,
			message: "Success",
		});
	} catch (err: any) {
		return res.status(500).json({
			success: false,
			message: err?.message ?? err?.toString() ?? "Unknown error",
		});
	}
});

app.listen(config.port, config.hostname, async () => {
	console.log(`Server is running on ${config.host}`);
});
