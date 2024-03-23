import os
import g4f.client
import requests
import json
from googlesearch import search
from BaseApi import BaseApi
from bs4 import BeautifulSoup

WARNING_PREFIX = "THIS IS NOT A QUESTION PROMPT, THE FOLLOWING IS THE INFORMATION BASE FOR THE AI AGENT\nOUTPUT="


class DeveloperApi(BaseApi):
	available_commands = [
		"CREATE_CODE",
		"RUN_SHELL_COMMAND",
		"READ_FILE",
		"GOOGLE",
		"NEXT_TASK",
		"VISIT_LINK",
	]

	def __init__(
		self,
		agent_name: str,
		developers_amount: int,
		max_depth=5,
		model="gpt-3.5-turbo",
		provider=None,
		verbose=False,
		client=g4f.client.Client,
	):
		super().__init__(
			context=open("./g4f-api/contexts/developer.txt", "r")
			.read()
			.replace("{{AGENT_NAME}}", agent_name)
			.replace("{{DEVELOPERS_AMOUNT}}", str(developers_amount - 1)),
			available_commands=self.available_commands,
			max_depth=max_depth,
			model=model,
			provider=provider,
			verbose=verbose,
   			client=client
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
		return "COMMAND_EXECUTED_SUCCESS"

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
			os.system(f"cd {self.sandbox_base} && {command} > tmp.log 2>&1")
			cmd_output = open(f"{self.sandbox_base}/tmp.log", "r").read()
			open(f"{self.sandbox_base}/output.log", "a").write(cmd_output)
			outputs.append({"command": command, "output": cmd_output})
			os.remove(f"{self.sandbox_base}/tmp.log")
		outputs_txt = json.dumps(outputs)
		self.perform_task(
			WARNING_PREFIX + outputs_txt,
			role="system",
		)
		return "COMMAND_EXECUTED_SUCCESS"

	def read_file(self, content: str):
		raw_files = content.split("{{FILES}}")[1].split("{{/FILES}}")[0]
		raw_files = raw_files.split("{{FILE_PATH}}")[1:]
		raw_files = [raw_file.split("{{/FILE_PATH}}")[0] for raw_file in raw_files]
		files = []
		for raw_file in raw_files:
			file_path = raw_file.strip()
			with open(self.sandbox_base + "/" + file_path, "r") as f:
				files.append({"file_path": file_path, "content": f.read()})
		files_txt = json.dumps(files)
		self.perform_task(
			WARNING_PREFIX + files_txt, role="system"
		)
		return "COMMAND_EXECUTED_SUCCESS"

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
		results_txt = json.dumps(results)
		self.perform_task(
			WARNING_PREFIX + results_txt,
			role="system",
		)
		return "COMMAND_EXECUTED_SUCCESS"

	def visit_link(self, content: str):
		links = content.split("{{LINKS}}")[1].split("{{/LINKS}}")[0]
		links = links.split("{{LINK}}")[1:]
		links = [link.split("{{/LINK}}")[0].strip() for link in links]
		print("DEBUG")
		print(links)
		contents = []
		for link in links:
			raw_html = requests.get(link).text
			soup = BeautifulSoup(raw_html, "html.parser")
			text = soup.get_text()
			contents.append({"link": link, "content": text})
		contents_txt = json.dumps(contents)
		print(contents_txt)
		self.perform_task(
			WARNING_PREFIX + contents_txt,
			role="system",
		)

		return "COMMAND_EXECUTED_SUCCESS"
