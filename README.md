# gpt-programmer

This project aims to create agents that can interact with the operating system and perform tasks like a human programmer. The api used is gpt4free, however any api can be used.


## Known issues

- After running lots of times the api can return Response 429: Rate limit reached. In that case you can use a proxy or wait some time to run again.
- The agents for some reason often break out of the format and start writing in a different way. It is necessary to revise the contexts of the agents to avoid this in future versions.

## Just stuff:

- `airoboros-70b` works better than `gpt-3.5-turbo` model
 