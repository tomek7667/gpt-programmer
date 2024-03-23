import os
from googlesearch import search
from BaseApi import BaseApi


class DeveloperApi(BaseApi):
	available_commands = ["CREATE_CODE", "RUN_SHELL_COMMAND", "READ_FILE", "GOOGLE", "NEXT_TASK"]

	def __init__(
		self,
		agent_name: str,
		developers_amount: int,
		max_depth=5,
		model="gpt-3.5-turbo",
	):
		super().__init__(
			context=open("./g4f-api/contexts/developer.txt", "r")
			.read()
			.replace("{{AGENT_NAME}}", agent_name)
			.replace("{{DEVELOPERS_AMOUNT}}", str(developers_amount)),
			available_commands=self.available_commands,
			max_depth=max_depth,
			model=model,
		)

	def create_code(self, content: str):
		raw_files = content.split("{{FILE}}")[1:]
		raw_files = [raw_file.split("{{/FILE}}")[0] for raw_file in raw_files]
		files = []
		for raw_file in raw_files:
			file_path = raw_file.split("{{FILE_PATH}}")[1].split("{{/FILE_PATH}}")[0]
			code = raw_file.split("{{CODE}}")[1].split("{{/CODE}}")[0]
			files.append({"file_path": file_path, "code": code})

		for file in files:
			dirs = file["file_path"].split("/")[:-1]
			os.makedirs(self.sandbox_base + "/".join(dirs), exist_ok=True)
			p = self.sandbox_base + "/" + file["file_path"]

			with open(p, "w") as f:
				f.write(file["code"])
		return "COMMAND_EXECUTED"

	def run_shell_command(self, content: str):
		raw_commands = content.split("{{SHELL_COMMANDS}}")[1].split(
			"{{/SHELL_COMMANDS}}"
		)[0]
		shellcommands = raw_commands.split("{{SHELL}}")[1:]
		shellcommands = [
			shellcommand.split("{{/SHELL}}")[0] for shellcommand in shellcommands
		]
		outputs = []
		for shellcommand in shellcommands:
			command = shellcommand.strip()
			open(f"{self.sandbox_base}/output.log", "a").write(f">>> {command}\n")
			os.system(f"cd {self.sandbox_base} && {command} > tmp.log")
			cmd_output = open(f"{self.sandbox_base}/tmp.log", "r").read()
			open(f"{self.sandbox_base}/output.log", "a").write(cmd_output)
			outputs.append({"command": command, "output": cmd_output})
		outputs_txt = "\n".join(
			[f"{output['command']}:\n{output['output']}" for output in outputs]
		)
		self.perform_task(
			f"Here are the outputs of the commands you requested:\n{outputs_txt}",
			role="system",
		)
		return "COMMAND_EXECUTED"

	def read_file(self, content: str):
		raw_files = content.split("{{FILES}}")[1].split("{{/FILES}}")[0]
		raw_files = raw_files.split("{{FILE_PATH}}")[1:]
		raw_files = [raw_file.split("{{/FILE_PATH}}")[0] for raw_file in raw_files]
		files = []
		for raw_file in raw_files:
			file_path = raw_file.strip()
			with open(self.sandbox_base + "/" + file_path, "r") as f:
				files.append({"file_path": file_path, "content": f.read()})
		files_txt = "\n".join(
			[f"{file['file_path']}:\n{file['content']}" for file in files]
		)
		self.perform_task(f"Here are the files you requested:\n{files_txt}", role="system")
		return "COMMAND_EXECUTED"

	def google(self, content: str):
		search_terms = content.split("{{SEARCH_TERMS}}")[1].split("{{/SEARCH_TERMS}}")[
			0
		]
		search_terms = search_terms.split("{{SEARCH_TERM}}")[1:]
		search_terms = [
			search_term.split("{{/SEARCH_TERM}}")[0] for search_term in search_terms
		]
		search_terms = [
			{
				"num_results": search_term.split("{{NUM_RESULTS}}")[1].split(
					"{{/NUM_RESULTS}}"
				)[0],
				"content": search_term.split("{{CONTENT}}")[1].split("{{/CONTENT}}")[0],
			}
			for search_term in search_terms
		]
		results = []
		for search_term in search_terms:
			result = search(
				search_term["content"],
				num_results=int(search_term["num_results"]),
				advanced=True,
			)
			results.append(
				{
					"search_term": search_term["content"],
					"results": [
						{
							"title": r.title,
							"link": r.url,
							"description": r.description,
						}
						for r in result
					],
				}
			)
		results_txt = "\n".join(
			[
				f"SEARCH TERM: {result['search_term']}:\n"
				+ "\n".join(
					[
						f"Title: {r['title']}\nLink: {r['link']}\nDescription: {r['description']}\n\n"
						for r in result["results"]
					]
				)
				for result in results
			]
		)
		self.perform_task(
			f"Here are the search results you have requested:\n{results_txt}", role="system"
		)
		return "COMMAND_EXECUTED"
