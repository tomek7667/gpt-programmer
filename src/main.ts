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
		const { action, workDir, message }: z.infer<typeof Action.Create> =
			parsed.data;
		const api = new Api({
			workDir,
		});

		const result = await api.action(action).perform(message);

		return res.status(200).json({
			success: true,
			message: "Success",
			data: result,
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
