from DeveloperApi import DeveloperApi

prompts = [
	"Create a python program that will create an array of all permutations of letters 'lucjan'. Print the array. and then print length of this array",
	"Run the program"
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
