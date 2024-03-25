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
		case A.ListDirs: {
			return res.status(200).json({
				success: true,
				message: "Success",
				data: await api.ListDirs.perform(data.message),
			});
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
	// Test 1.
	// await api.WriteFile.perform(
	// 	"Create a ruby program that will print out fibonacci numbers up to 10. (or given N)"
	// );
	// Test 2.
	// await api.WriteFile.perform("Write 10 files containing random words");
	// Test 3.
	// await api.WriteFile.perform("Create an empty directory called 'lalala'");
	// await api.WriteFile.perform(
	// 	"Create file abc.txt in directory 'lalala' with whole alphabet inside of it"
	// );
	// const responseForUser = await api.ListDirs.perform(
	// 	"list files in directory 'lalala'"
	// );
	// console.log(responseForUser);
	// Test 4.
	// console.log(api.projectRoot);
	// await new Promise((resolve) => setTimeout(resolve, 10000));
	// const result = await api.ListDirs.perform(
	// 	"List all files in current directory"
	// );
	// console.log(result);
	// [
	// 	{
	// 		originalPath: ".",
	// 		path: "C:\\Users\\tomek\\cyberman\\gpt-programmer\\sandbox\\00-12-58",
	// 		files: ["abc", "essa"],
	// 	},
	// ];
});
