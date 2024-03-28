import colors from "colors";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "fs";
import { Api } from "./domain";
import { config } from "./config";

const makeApi = (workDir: string) => {
	return new Api({
		workDir: `sandbox/${workDir}`,
	});
};

const tests = [
	// test1
	async () => {
		await makeApi("test1").WriteFile.perform(
			"Create a ruby program that will print out fibonacci numbers up to 10. (or given N)"
		);

		// Assert
		if (
			!readdirSync("sandbox/test1").some((file) => file.endsWith(".rb"))
		) {
			console.log("test1: file '*.rb' not found".red);
			return false;
		}

		return true;
	},

	// test2
	async () => {
		await makeApi("test2").WriteFile.perform(
			"Write 10 files containing random words"
		);

		// Assert
		if (readdirSync("sandbox/test2").length !== 10) {
			console.log("test2: files count !== 10".red);
			return false;
		}

		return true;
	},

	// test3
	async () => {
		const api = makeApi("test3");
		await api.WriteFile.perform(
			"Create an empty directory called './lalala'"
		);
		await api.WriteFile.perform(
			"Create file abc.txt in directory './lalala' with whole alphabet inside of it"
		);
		const dirs = await api.ListDirs.perform(
			"list files in directory './lalala'"
		);

		// Assert
		if (!dirs) {
			console.log("test3: dirs is undefined".red);
			return false;
		}
		if (dirs.length !== 1) {
			console.log("test3: dirs.length !== 1".red);
			return false;
		}
		const [dir] = dirs;
		if (dir.files.length !== 1) {
			console.log("test3: dir.files.length !== 1".red);
			return false;
		} else if (dir.files[0] !== "abc.txt") {
			console.log("test3: dir.files[0].name !== 'abc.txt'".red);
			return false;
		}

		return true;
	},

	// test4
	async () => {
		const api = makeApi("test4");
		await api.WriteFile.perform(
			"Create a 'abc' and 'essa' files in the current directory"
		);
		const result = await api.ListDirs.perform(
			"List all files in current directory"
		);

		// Assert
		if (!result) {
			console.log("test4: result is undefined".red);
			return false;
		}
		if (result.length !== 1) {
			console.log("test4: result.length !== 1".red);
			return false;
		}
		const [dir] = result;
		if (dir.files.length !== 2) {
			console.log("test4: dir.files.length !== 2".red);
			return false;
		}
		if (!dir.files.includes("abc")) {
			console.log("test4: dir.files doesn't include 'abc'".red);
			return false;
		}
		if (!dir.files.includes("essa")) {
			console.log("test4: dir.files doesn't include 'essa'".red);
			return false;
		}

		return true;
	},

	// test5
	async () => {
		const api = makeApi("test5");
		await api.WriteFile.perform(
			"Create 3 files: a.txt, f.txt. Both having '12345-abcdef' inside"
		);
		const files = await api.ListDirs.perform(
			"list all files in current dir"
		);

		// Assert
		if (!files) {
			console.log("test5: files is undefined".red);
			return false;
		}
		if (files.length !== 1) {
			console.log("test5: files.length !== 1".red);
			return false;
		}
		const [dir] = files;
		if (dir.files.length !== 2) {
			console.log("test5: dir.files.length !== 2".red);
			return false;
		}
		let prompt = `Read files: `;
		dir.files.forEach((f) => {
			prompt += `${dir.originalPath}/${f}, `;
		});
		const contents = await api.ReadFiles.perform(prompt);
		if (!contents) {
			console.log("test5: contents is undefined".red);
			return false;
		}
		if (contents.length !== 2) {
			console.log("test5: contents.length !== 2".red);
			return false;
		}
		if (!contents.every((c) => c.content === "12345-abcdef")) {
			console.log(
				"test5: contents.every(c => c.content === '12345-abcdef')".red
			);
			return false;
		}

		return true;
	},

	// test6
	async () => {
		const api = makeApi("test6");
		await api.WriteFile.perform(
			"Create a python main.py file with print of hello world"
		);
		const result = await api.RunCommand.perform("Run main.py file");

		// Assert
		if (!result) {
			console.log("test6: result is undefined".red);
			return false;
		}
		if (!result.stdout.toLowerCase().includes("hello world")) {
			console.log(
				"test6: result.stdout doesn't include 'hello world'".red
			);
			return false;
		}

		return true;
	},

	// test7
	async () => {
		const result = await makeApi("test7").GetLinks.perform("ai blogs");

		// Assert
		if (!result) {
			console.log("test7: result is undefined".red);
			return false;
		}
		if (result.length === 0) {
			console.log("test7: result.length === 0".red);
			return false;
		}

		return true;
	},

	// test8
	async () => {
		await makeApi("test8").WriteTaskList.perform(
			"Save links of pocketbase documentation to a file called links.txt"
		);

		// Assert
		const test8Files = readdirSync("sandbox/test8");
		if (!test8Files.some((file) => file.endsWith(".txt"))) {
			console.log("test8: file '*.txt' not found".red);
			return false;
		}
		const linksTxt = test8Files.find((file) => file.endsWith(".txt"));
		if (!linksTxt) {
			console.log("test8: linksTxt is undefined".red);
			return false;
		}
		const linksTxtContent = readFileSync(
			`sandbox/test8/${linksTxt}`,
			"utf-8"
		);
		if (!linksTxtContent.toLowerCase().includes("pocketbase")) {
			console.log(
				"test8: linksTxtContent doesn't include 'pocketbase'".red
			);
			return false;
		}

		return true;
	},

	// test9
	async () => {
		await makeApi("test9").WriteTaskList.perform(
			"Find recipes for rare finnish dishes, and then save just the links to them as ordered list in a file called finnish.txt"
		);

		// Assert
		const test9Files = readdirSync("sandbox/test9");
		if (!test9Files.includes("finnish.txt")) {
			console.log("test9: 'finnish.txt' not found".red);
			return false;
		}

		return true;
	},

	// test10
	async () => {
		const api = makeApi("test10");
		const links = await api.GetLinks.perform(
			"Cinnamon roll recipe, step by step guide"
		);

		// Assert
		if (!links) {
			console.log("test10: links is undefined".red);
			return false;
		}
		const [firstLink] = links;
		const content = await api.VisitLink.perform(firstLink.url);
		if (!content) {
			console.log("test10: content is undefined".red);
			return false;
		}
		await api.WriteFile.perform(
			`Save a cinnamon roll recipe to 'cinnamon_roll_recipe.txt' file based on the cinnamon roll recipe website context |{{{${content.content}}}`
		);
		const test10Files = readdirSync("sandbox/test10");
		if (!test10Files.includes("cinnamon_roll_recipe.txt")) {
			console.log("test10: 'cinnamon_roll_recipe.txt' not found".red);
			return false;
		}
		return true;
	},

	// test11
	async () => {
		const api = makeApi("test11");
		await api.WriteFile.perform(
			"Create a file called 'essa.txt' ('helloworld' inside), then create a directory called 'abc' then, inside that directory, create a file called 'def.txt' ('belloworld' inside)"
		);

		// Assert
		const files = readdirSync("sandbox/test11");
		if (!files.includes("abc")) {
			console.log("test11: 'abc' not found".red);
			return false;
		}
		if (!files.includes("essa.txt")) {
			console.log("test11: 'essa.txt' not found".red);
			return false;
		}
		const abcFiles = readdirSync("sandbox/test11/abc");
		if (!abcFiles.includes("def.txt")) {
			console.log("test11: 'def.txt' not found".red);
			return false;
		}

		const result = await api.GetTree.perform("inside current directory");
		if (!result) {
			console.log("test11: result is undefined".red);
			return false;
		}
		if (!result.tree.includes("abc") || !result.tree.includes("essa.txt")) {
			console.log(
				"test11: result.tree doesn't include 'abc' or 'essa.txt'".red
			);
			return false;
		}
		return true;
	},

	// test12
	async () => {
		mkdirSync("sandbox/test12");
		mkdirSync("sandbox/test12/abc");
		mkdirSync("sandbox/test12/def");
		mkdirSync("sandbox/test12/def/ghi");
		mkdirSync("sandbox/test12/abc/ghi");
		mkdirSync("sandbox/test12/abc/jkl");
		mkdirSync("sandbox/test12/def/mno");
		mkdirSync("sandbox/test12/def/ghi/pqr");
		writeFileSync("sandbox/test12/abc/ghi/xyz.txt", "hello world");
		writeFileSync("sandbox/test12/abc/jkl/xyz.txt", "hello world");
		writeFileSync("sandbox/test12/def/mno/xyz.txt", "hello world");
		writeFileSync("sandbox/test12/def/ghi/pqr/xyz.txt", "hello world");
		await makeApi("test12").WriteTaskList.perform(
			"Save tree structure of current dir to a file called 'tree.txt'"
		);

		// Assert
		const test12Files = readdirSync("sandbox/test12");
		if (!test12Files.includes("tree.txt")) {
			console.log("test12: 'tree.txt' not found".red);
			return false;
		}
		const treeTxtContent = readFileSync("sandbox/test12/tree.txt", "utf-8");
		if (
			!treeTxtContent.includes("abc") ||
			!treeTxtContent.includes("def")
		) {
			console.log(
				"test12: treeTxtContent doesn't include 'abc' or 'def'".red
			);
			return false;
		}
		return true;
	},
];

const printSpacer = () => {
	console.log(
		`==============================================================`.cyan
			.bold
	);
};

export const performRegression = async (testNumber?: number) => {
	colors.enable();
	rmSync("sandbox", { recursive: true });
	mkdirSync("sandbox", { recursive: true });
	const testSummary: { [key: string]: boolean } = {};
	printSpacer;
	if (testNumber !== undefined) {
		try {
			const test = tests[testNumber - 1];
			const isSuccess = await test();
			if (isSuccess) {
				printSpacer();
				console.log(`\t\t\tTest ${testNumber} passed!`.green.bold);
				printSpacer();
			} else {
				printSpacer();
				console.log(`\t\t\tTest ${testNumber} failed!`.red.bold);
				printSpacer();
			}
		} catch (e) {
			console.log(e);
			printSpacer();
			console.log(`\t\t\tTest ${testNumber} failed!`.red.bold);
			printSpacer();
		}
		return;
	}

	try {
		for (let i = 0; i < tests.length; i++) {
			try {
				const test = tests[i];
				printSpacer();
				console.log(`\t\t\tRunning test ${i + 1}`);
				for (
					let trialNumber = 0;
					trialNumber < config.retryRegressionNumber - 1;
					trialNumber++
				) {
					const isSuccess = await test();
					if (isSuccess) {
						console.log(`\t\t\tTest ${i + 1} passed!`.green.bold);
						testSummary[`Test ${i + 1}`] = true;
						break;
					}
					rmSync(`sandbox/test${i + 1}`, { recursive: true });
					testSummary[`Test ${i + 1}`] = false;
				}
				if (testSummary[`Test ${i + 1}`] === false) {
					const isSuccess = await test();
					if (isSuccess) {
						console.log(`\t\t\tTest ${i + 1} passed!`.green.bold);
						testSummary[`Test ${i + 1}`] = true;
					} else {
						testSummary[`Test ${i + 1}`] = false;
					}
				}
			} catch (e) {
				console.log(`\t\t\tTest ${i + 1} failed!`.red.bold);
				testSummary[`Test ${i + 1}`] = false;
			}
		}
		printSpacer();
	} finally {
		console.log("\n\n\t\t\tRegression summary:\t\t\t\n".bgBlack.white);
		console.log(testSummary);
	}
};

performRegression(process.argv[2] ? Number(process.argv[2]) : undefined);
