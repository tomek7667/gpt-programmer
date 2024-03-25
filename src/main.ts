import { z } from "zod";
import bodyParser from "body-parser";
import express from "express";
import { A, AcceptedActions, Actions, api } from "./domain/Api";

const hostname = "localhost";
const port = 3000;
const app = express();

app.use(bodyParser.json());

app.post("/actions", async (req, res) => {
	const parsed = Actions.Create.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json(parsed);
		return;
	}
	const data: z.infer<typeof Actions.Create> = parsed.data;
	switch (data.action) {
		case A.DeleteFile: {
			await api.DeleteFile.perform(data.message);
			break;
		}
		case A.WriteFile: {
			await api.WriteFile.perform(data.message);
			break;
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
});

app.listen(port, hostname, async () => {
	console.log(`Server is running on http://${hostname}:${port}`);
});
