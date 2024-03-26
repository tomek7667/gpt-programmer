import { z } from "zod";
import bodyParser from "body-parser";
import express from "express";
import { api, Action, Actions, AcceptedActions } from "./domain";
import { config } from ".";

const app = express();

app.use(bodyParser.json());

app.post("/actions", async (req, res) => {
	const parsed = Action.Create.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json(parsed);
		return;
	}
	const data: z.infer<typeof Action.Create> = parsed.data;
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

app.listen(config.port, config.hostname, async () => {
	console.log(`Server is running on ${config.host}`);
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
	// Test 5.
	// await api.WriteFile.perform(
	// 	"Create 3 files: a.txt, f.txt. Both having '12345-abcdef' inside"
	// );
	// const files = await api.ListDirs.perform("list all files in current dir");
	// console.log(files);
	// /*[
	// 	{
	// 		originalPath: '.',
	// 		path: 'C:\\Users\\tomek\\cyberman\\gpt-programmer\\sandbox\\00-59-53',
	// 		files: [ 'a.txt', 'f.txt' ]
	// 	}
	// ]*/
	// if (!files) {
	// 	console.log("No files present");
	// } else {
	// 	let prompt = `Read files: `;
	// 	files.forEach((d) => {
	// 		d.files.forEach((f) => {
	// 			prompt += `${d.originalPath}/${f}, `;
	// 		});
	// 	});
	// 	console.log(prompt);
	// 	// Read files: ./a.txt, ./f.txt,
	// 	const contents = await api.ReadFiles.perform(prompt);
	// 	console.log(contents);
	// 	/*[
	// 		{
	// 			path: 'C:\\Users\\tomek\\cyberman\\gpt-programmer\\sandbox\\00-59-53\\a.txt',
	// 			content: '12345-abcdef'
	// 		},
	// 		{
	// 			path: 'C:\\Users\\tomek\\cyberman\\gpt-programmer\\sandbox\\00-59-53\\f.txt',
	// 			content: '12345-abcdef'
	// 		}
	// 	]*/
	// }
	// Test 6.
	// Comment: I specifically said it should be a helloworld.py file, but the first task created a main.py file, so next tasks failed. That's why a tester is needed that will tell whether the action needs to be done again or not. Each step preferably. Faulty run: ./sandbox/02-15-27
	// await api.WriteTaskList.perform(
	// 	"Create helloworld.py python file with print of hello world, read it and then save it as second.py"
	// );
	// Success result test: sandbox/02-19-10
	// Test 7.
	// await api.WriteFile.perform(
	// 	"Create a python main.py file with print of hello world"
	// );
	// const result = await api.RunCommand.perform("Run main.py file");
	// console.log({ result });
	// Success result test: sandbox/11-17-37
	// // { result: { stdout: 'Hello World!\r\n', stderr: '', error: '' } }
	// Test 8.
	// const result = await api.GetLinks.perform("ai blogs");
	// Test 9. sandbox/12-20-27/links.txt
	// await api.WriteTaskList.perform(
	// 	"Save links of pocketbase documentation to a file called links.txt"
	// );
	// Test 10. sandbox/14-01-01/cinnamon-rolls.txt
	// await api.WriteTaskList.perform(
	// 	"Find recipes for cinnamon rolls, and then save links to them as ordered list in a file called cinnamon-rolls.txt"
	// );
	// Test 11. sandbox/14-50-02/finnish.txt
	// await api.WriteTaskList.perform(
	// 	"Find recipes for rare finnish dishes, and then save just the links to them as ordered list in a file called finnish.txt"
	// );
});
