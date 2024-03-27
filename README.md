<h1 align="center">GPT Programmer</h2>

<p align="center">
   <img src=".assets/ai.jfif" alt="GPT Programmer Logo" width="350">
</p>

<h2 align="center">Use a model of your choice, and give it superpowers with <i>GPT Programmer</i>. It allows the LLM to interact with:</h1>

<div align="center">
   <li><b>running commands</b> on the host system</li>
   <li>the host <b>file system</b></li>
   <li>the <b>internet</b></li>
   <li><i><b>any</b> custom action, that you can implement in TypeScript.</i></li>
</div>

## Setup

1. use node version 21.7.1 (with `npm i -g yarn`)
2. Either:
   1. <i>(Free)</i> Open [LM Studio](https://lmstudio.ai/), go to search and find a model you would like to use and then go to `Local Server`, load the model and `Start Server`.
   2. <i>(Rich people)</i> Configure `src/config.ts` to use OpenAI API
3. Run `yarn` to install the dependencies

## Running

1. Run `yarn start` to start the API that will interact with the model

## Roadmap

- [x] Add possibility for the model to interact with the filesystem *(read, write, delete files and directories, preferably in a sandbox new directory - might be tricky to edit projects later)* with actions.
- [x] Add an organizer action that will be able to call other actions in the system.
- [x] Refactor `Api.ts` so that the [development section](#Development) is easier to extend, and each action is in a separate file.
- [x] Add a way to run commands on the host system.
- [x] Add a way to list google search results.
- [x] Add a way to visit websites *(beautifully souped most probably)* and return the content.
- [x] Add easy regression testing for all actions
- [x] Add `GetTree` action that will return a tree of the filesystem at the given path.
- [ ] Make the `WriteTaskList` action ability to edit an already established project.
- [ ] Add a Tester action that will verify that the previous action from the `TaskList` was successful or not. If it's not successful, it will try to run the action again.
- [ ] Add a status to each task on the task list

## Development

### Documentation

- [TypeDoc documentation](https://gpt-programmer.cyber-man.pl/)

### Extending actions

If you would like to add a new action for the model, follow these steps:

For adding action *AbcdAction*:

1. Create a file with context for the bot of your action to `./src/domain/contexts/AbcdAction`.
2. Add required stuff to `src/domain/actions/index.ts`.
3. Create `src/domain/actions/AbcdAction.ts` with a function `AbcdAction` that will return `StandardAction` instance.
   1. Example of action that will return some data can be found at `src/domain/actions/ListDirs.ts`.
   2. Example of action that will not return any data can be found at `src/domain/actions/WriteFile.ts`.
4. Create a getter for the action in `src/domain/Api.ts`,
5. Add a case to the switch statement in `src/main.ts` to handle the action. Add return data if the action returns something.
6. Finally, add invokation of this action to `src/domain/contexts/WriteTaskList` context.
