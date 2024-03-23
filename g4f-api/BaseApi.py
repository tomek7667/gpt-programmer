import g4f.client
from g4f.providers.types import ProviderType
import os
import json
import random
import string


class BaseApi:
	def __init__(
		self,
		context: str,
		available_commands: list[str],
		max_depth: int = 5,
		model: str = "gpt-3.5-turbo",
		verbose: bool = False,
		provider: ProviderType = None,
		client=g4f.client.Client,
	):
		self.model = model
		self.provider = provider
		self.verbose = verbose
		self.client = client(
			provider=self.provider,
		)
		self.history = []
		self.max_depth = max_depth
		self.available_commands = available_commands
		self.id = "".join(random.choices(string.ascii_lowercase, k=6))
		self.sandbox_base = f"sandbox/{self.id}"
		self.context = context
		os.makedirs(self.sandbox_base, exist_ok=True)
		print(f"Initialized API with ID: {self.id}")
		self.history.append(
			{
				"role": "system",
				"content": f"Here is the context you must follow. Under no circumstances should you deviate from this context. {self.context}",
			}
		)

	@staticmethod
	def load(path):
		with open(path, "r") as f:
			data = json.load(f)
		return BaseApi(data["model"], data["messages"])

	def save_log(self, path):
		with open(path, "w") as f:
			f.write(json.dumps({"model": self.model, "messages": self.history}))

	def perform_task(self, text: str, role: str = "user", depth: int = 0):
		if self.history[-1]["role"] != "system" or self.history[-1]["content"] != text:
			# we do not want to repeat same ol error message to the stupid ai
			self.history.append({"role": role, "content": text})

		response = self.client.chat.completions.create(
			model=self.model,
			messages=self.history,
			provider=self.provider
		)
		messages = [m.to_json() for m in response.choices]
		for message in messages:
			self.history.append(
				{
					"role": message["message"]["role"],
					"content": message["message"]["content"],
				}
			)

		output = self.determine_command(messages[-1]["message"]["content"])
		if depth > self.max_depth:
			error_filename = f"{self.sandbox_base}/error.log.json"
			open(error_filename, "w").write(json.dumps(self.history))
			raise TimeoutError(
				f"DEPTH_EXCEEDED, Maximum specified depth of {self.max_depth} exceeded. The conversation has been saved to ./{error_filename}"
			)
		if self.verbose:
			self.save_log(self.sandbox_base + f"/debug.log.json")
		if output != "NEXT_TASK":
			return self.perform_task(output, role="system", depth=depth + 1)

		# TODO: Here add verifier for the job of the agent

	def determine_command(self, content: str) -> str:
		try:
			if len(content.strip()) < 3:
				self.history.pop()
				return f"NEXT_TASK"
			command = content.split("{{COMMAND}}")[1].split("{{/COMMAND}}")[0].strip()
			if command == "NEXT_TASK":
				return "NEXT_TASK"
			if command in self.available_commands:
				print(f"Ivoking command: {command}")
				return eval(f"self.{command.lower()}(content)")
			else:
				return (
					f"UNKNOWN_COMMAND - available commands: {self.available_commands}"
				)
		except Exception as e:
			if self.verbose:
				print(e)
				self.save_log(self.sandbox_base + f"/faulty_model.log.json")
			# self.history.pop()
			return f"INVALID_COMMAND_FORMAT. You have completely failed and forgot your context. The only available commands are: {self.available_commands}. Remember to wrap them correctly as shown in your context: {{{{COMMAND}}}}SOME_ACTION{{{{/COMMAND}}}}."
