from DeveloperApi import DeveloperApi
from LMStudio import Client

text_cases = [
	# [
	# 	"Search for the best Python libraries for data science in 2024. I want only verified sources. at least 3 different sources",
	# 	"Write sources links to 'links.txt' file",
	# 	"Visit all links and write very short summary of each article to 'summaries<1,2,3>.txt' files",
	# ],
	[
		"Write a hello world program in python",
		"Execute your program",
	]
]

def main():
	for prompts in text_cases:
		developer = DeveloperApi(
			agent_name="John",
			developers_amount=1,
			model="deepseek-ai_deepseek-coder-6.7b-instruct",
			verbose=True,
   			client=Client
		)
		for prompt in prompts:
			developer.perform_task(prompt)

		developer.save_log(developer.sandbox_base + f"/debug.log.json")

if __name__ == "__main__":
	main()
