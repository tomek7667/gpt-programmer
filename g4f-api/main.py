from DeveloperApi import DeveloperApi

prompts = [
	"Create 5 files that will contain 7 random characters",
	"Read the content of the files you created",
	"write a text file with combined read content"
]

def main():
	api = DeveloperApi(
		agent_name="John",
		developers_amount=1,
	)
	for prompt in prompts:
		api.ask_model(prompt)
	api.save(api.sandbox_base + f"/debug.log.json")
if __name__ == "__main__":
	main()
