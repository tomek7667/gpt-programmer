import os
from BaseApi import BaseApi

class DeveloperApi(BaseApi):
	available_commands = ["CREATE_CODE", "RUN_SHELL_COMMAND", "READ_FILE"]
    
	def __init__(self, agent_name: str, developers_amount: int, max_depth=5, model="gpt-3.5-turbo"):
		super().__init__(
      		context=open("./g4f-api/contexts/developer.txt", "r")
        				.read()
            			.replace("{{AGENT_NAME}}", agent_name)
               			.replace("{{DEVELOPERS_AMOUNT}}",
                           str(developers_amount)),
			available_commands=self.available_commands,
			max_depth=max_depth,
			model=model
   		)
    
	def create_code(self, content: str):
		raw_files = content.split("{{FILE}}")[1:]
		raw_files = [raw_file.split("{{/FILE}}")[0] for raw_file in raw_files]
		files = []
		for raw_file in raw_files:
			file_path = raw_file.split("{{FILE_PATH}}")[1].split("{{/FILE_PATH}}")[0]
			code = raw_file.split("{{CODE}}")[1].split("{{/CODE}}")[0]
			files.append({
				"file_path": file_path,
				"code": code
			})
	
		for file in files:
			dirs = file["file_path"].split("/")[:-1]
			os.makedirs(self.sandbox_base + "/".join(dirs), exist_ok=True)
			p = self.sandbox_base + "/" + file["file_path"]
			
			with open(p, "w") as f:
				f.write(file["code"])
		return "COMMAND_EXECUTED"

	def run_shell_command(self, content: str):
		raw_commands = content.split("{{SHELL_COMMANDS}}")[1].split("{{/SHELL_COMMANDS}}")[0]
		shellcommands = raw_commands.split("{{SHELL}}")[1:]
		shellcommands = [shellcommand.split("{{/SHELL}}")[0] for shellcommand in shellcommands]
		outputs = []
		for shellcommand in shellcommands:
			command = shellcommand.strip()
			open(f"{self.sandbox_base}/output.log", "a").write(f">>> {command}\n")
			os.system(f"cd {self.sandbox_base} && {command} > tmp.log")
			cmd_output = open(f"{self.sandbox_base}/tmp.log", "r").read()
			open(f"{self.sandbox_base}/output.log", "a").write(cmd_output)
			outputs.append({
				"command": command,
				"output": cmd_output
			})
		outputs_txt = "\n".join([f"{output['command']}:\n{output['output']}" for output in outputs])
		self.ask_model(f"Here are the outputs of the commands you requested:\n{outputs_txt}", role="system")
		return "COMMAND_EXECUTED"

	def read_file(self, content: str):
		raw_files = content.split("{{FILES}}")[1].split("{{/FILES}}")[0]
		raw_files = raw_files.split("{{FILE_PATH}}")[1:]
		raw_files = [raw_file.split("{{/FILE_PATH}}")[0] for raw_file in raw_files]
		files = []
		for raw_file in raw_files:
			file_path = raw_file.strip()
			with open(self.sandbox_base + "/" + file_path, "r") as f:
				files.append({
					"file_path": file_path,
					"content": f.read()
				})
		files_txt = "\n".join([f"{file['file_path']}:\n{file['content']}" for file in files])
		self.ask_model(f"Here are the files you requested:\n{files_txt}", role="system")
		return "COMMAND_EXECUTED"
		

