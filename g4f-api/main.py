from DeveloperApi import DeveloperApi

prompts = [
	"Search for the best Python libraries for data science in 2024. I want only verified sources. Just have them in mind",
	"Write links to 'info.txt' file",
]


def main():
	developer = DeveloperApi(
		agent_name="John",
		developers_amount=1,
		model="airoboros-70b"
	)
	for prompt in prompts:
		developer.perform_task(prompt)

	developer.save_log(developer.sandbox_base + f"/debug.log.json")

if __name__ == "__main__":
	main()
