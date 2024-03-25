# gpt-programmer

## New apporach

- 1 bot = 1 task
- 2 smart bots: Organizer and a Tester.
- Organizer is responsible for preparing a plan for the project (step by step) and is informed which bots can do what.
- Tester talks with the asignee and verifies whether a simple task was completed correctly.
- There is only 1 prompt for the whole project

Considerations:

- In order to work on already developed project, manager can develop a plan and scan the project and tick off stuff that is done.

## Deprecated (1):

- `g4f-api/` directory. It had a number of problems:
  - ~70% of the time it use the format specified improperly
  - 'Forgetting' its abilities to e.g. browse internet, run commands (stuff the AI suually can't do).
  - Too specialist, the task and power was given for too stupid AI.
  - No verification
  - Can be extended as much as the AI is smart (which is not very much)
  - Can't work in a team
  - Can't work on previously done projects

This project aims to create agents that can interact with the operating system and perform tasks like a human programmer. The api used is gpt4free, however any api can be used.


## Known issues

- After running lots of times the api can return Response 429: Rate limit reached. In that case you can use a proxy or wait some time to run again.
- The agents for some reason often break out of the format and start writing in a different way. It is necessary to revise the contexts of the agents to avoid this in future versions.

## Just stuff:

- `airoboros-70b` works better than `gpt-3.5-turbo` model
 