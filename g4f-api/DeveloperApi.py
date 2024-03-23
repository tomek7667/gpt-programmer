import os
from BaseApi import BaseApi

class DeveloperApi(BaseApi):
	available_commands = ["CREATE_CODE", "RUN_SHELL_COMMAND"]
    
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
		for shellcommand in shellcommands:
			command = shellcommand.strip()
			open(f"{self.sandbox_base}/output.log", "a").write(f">>> {command}\n")
			os.system(f"cd {self.sandbox_base} && {command} >> output.log")
		return "COMMAND_EXECUTED"
