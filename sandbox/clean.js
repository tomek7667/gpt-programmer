const fs = require("fs");

const main = async () => {
	const sandboxPath = "./sandbox";
	const dirs = fs.readdirSync(sandboxPath);
	for (const dir of dirs) {
		if (dir.includes(".")) {
			continue;
		}
		const inside = fs.readdirSync(`${sandboxPath}/${dir}`);
		if (inside.length === 0) {
			console.log(`Removing ${dir}`);
			fs.rmdirSync(`${sandboxPath}/${dir}`);
		}
	}
};

main();
