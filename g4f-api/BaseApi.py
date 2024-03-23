import g4f.client
import os
import json
import random
import string

class BaseApi:
	def __init__(self, context: str, available_commands: list[str], max_depth: int = 5, model: str = "gpt-3.5-turbo"):
		self.client = g4f.client.Client()
		self.history = []
		self.model = model
		self.max_depth = max_depth
		self.available_commands = available_commands
		self.id = ''.join(random.choices(string.ascii_lowercase, k=6))
		self.sandbox_base = f"sandbox/{self.id}"
		os.makedirs(self.sandbox_base, exist_ok=True)
		print(f"Initialized API with ID: {self.id}")
		self.history.append({
			"role": "system",
			"content": f"Here is the context you must follow. Under no circumstances should you deviate from this context. {{CONTEXT}}{context}{{/CONTEXT}}"
		})

	def generate_image(self, text: str) -> str:
		return self.client.images.generate(
			model="gemini",
			prompt=text
		)

	@staticmethod
	def load(path):
		with open(path, "r") as f:
			data = json.load(f)
		return BaseApi(data["model"], data["messages"])

	def save(self, path):
		with open(path, "w") as f:
			f.write(json.dumps({
				"model": self.model,
				"messages": self.history
			}))
   
	def ask_model(self, text: str, role: str = "user", depth: int = 0) -> str:
		self.history.append(
			{
				"role": role,
				"content": text
			}
		)

		response = self.client.chat.completions.create(
			model=self.model,
			messages=self.history,
		)
		messages = [m.to_json() for m in response.choices]
		for message in messages:
			self.history.append({
				"role": message['message']['role'],
				"content": message['message']['content']
			})

		output = self.determine_command(messages[-1]['message']['content'])
		if depth > self.max_depth:
			error_filename = f"error_{self.id}.json"
			open(error_filename, "w").write(json.dumps(self.history))
			raise TimeoutError(f"DEPTH_EXCEEDED, Maxiumum specified depth of {self.max_depth} exceeded. The conversation has been saved to ./{error_filename}")
  
		if output != "COMMAND_EXECUTED":
			return self.ask_model(output, role="system", depth=depth+1)
		return messages[-1]['message']['content']


	def determine_command(self, content: str) -> str:
		try:
			command = content.split("{{COMMAND}}")[1].split("{{/COMMAND}}")[0].strip()
			if command in self.available_commands:
				return eval(f"self.{command.lower()}(content)")
			else:
				return f"UNKNOWN_COMMAND - available commands: {self.available_commands}"
		except Exception as e:
			print(e)
			return f"INVALID_COMMAND_FORMAT ({e})"
