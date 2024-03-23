from DeveloperApi import DeveloperApi

prompts = [
	"Create 1 simple python program that prints 'Hello, World!' to the console. main1. Then main2 that will make fizzbuzz program. Create also main3 file that will print out first 8 fibonacci numbers. The business requirement id is 42021222",
 	"Create an python http server that will accept POST message on /api/v1/developer with body {\"content\": \"abc\"} and will print out the content",
 	"Create an ruby http server that will accept POST message on /api/v1/developer with body {\"content\": \"abc\"} and will print out the content",
 	"Create an typescript http server that will accept POST message on /api/v1/developer with body {\"content\": \"abc\"} and will print out the content",
]

def main():
	print("Running main function in g4f-api")
	for prompt in prompts:
		try:
			api = DeveloperApi(
				context=open("developer.context.txt", "r").read().replace("{{AGENT_NAME}}", "John").replace("{{DEVELOPERS_AMOUNT}}", "1"),
			)
			api.ask_model(prompt)
			api.save(f"api_{api.id}.json")
		except:
			print(f"Failed to run prompt: {prompt}")
    

if __name__ == "__main__":
	main()
