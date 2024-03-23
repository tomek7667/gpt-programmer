from openai import OpenAI


class Client:
	def __init__(self, provider):
		self.provider = provider
		self.chat = Chat()


class Chat:
	def __init__(self):
		self.completions = Completions()


class Message:
	def __init__(self, content, role):
		self.content = content
		self.role = role
  
	def to_json(self):
		return {"message": {"content": self.content, "role": self.role}}

class Completions:
	def __init__(self):
		pass

	def create(self, messages, model, provider):
		client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")
		completion = client.chat.completions.create(
			messages=messages,
			temperature=0.7,
   			model=model,
		)
		choices = [Message(c.message.content, c.message.role) for c in completion.choices]
		completion.choices = choices
		return completion
		
	


# client.chat.completions.create(
# 			model=self.model, messages=self.history, provider=self.provider
# 		)
