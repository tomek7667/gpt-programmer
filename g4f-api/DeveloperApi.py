import os
from BaseApi import BaseApi

class DeveloperApi(BaseApi):
	available_commands = ["CREATE_CODE"]
    
	def __init__(self, context, max_depth=5, model="gpt-3.5-turbo"):
		super().__init__(context=context, available_commands=self.available_commands, max_depth=max_depth, model=model)
    
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
