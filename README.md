# GPT Programmer

Use a model of your choice, and give it superpowers with *GPT Programmer*. It allows the LLM to interact with:

- running commands on the host system,
- the host file system,
- the internet,
- *any custom action, that you can implement in TypeScript.*

## Setup

1. use node version 21.7.1 (with `npm i -g yarn`)
2. Either:
   1. (Free) Open [LM Studio](https://lmstudio.ai/), go to search and find a model you would like to use and then go to `Local Server`, load the model and `Start Server`.
   2. (Rich people) Configure `src/config.ts` to use OpenAI API
3. Run `yarn` to install the dependencies

## Running

1. Run `yarn start` to start the API that will interact with the model

## Roadmap

- [x] Add possibility for the model to interact with the filesystem *(read, write, delete files and directories, preferably in a sandbox new directory - might be tricky to edit projects later)* with actions.
- [x] Add an organizer action that will be able to call other actions in the system.
- [ ] Add a way to run commands on the host system.
- [ ] Add a way to list google search results.
- [ ] Add a way to visit websites *(beautifully souped most probably)* and return the content.
- [ ] Add `GetTree` action that will return a tree of the filesystem at the given path.
- [ ] Make the `WriteTaskList` action ability to edit an already established project.
- [ ] Add a Tester action that will verify that the previous action from the `TaskList` was successful or not. If it's not successful, it will try to run the action again.
- [ ] Add a status to each task on the task list
- [ ] Refactor `Api.ts` so that the [development section](##Development) is easier to extend, and each action is in a separate file.

## Development

If you would like to add a new action for the model, follow these steps:

For adding action *AbcdAction*:

1. Create a file with context for the bot of your action to `./src/domain/actions/AbcdAction`
2. Create a new attribute in `./src/domain/ActionExamples.ts` named after the action `AbcdAction: []`
3. *(Optional)* Fill the array with any number of examples of the properly working bot
4. There are number of changes you would need to add to `./src/domain/Api.ts` file:
   1. Add to `export enum A { ... }` a new action `AbcdAction = "AbcdAction"`
   2. Add to `const action = z.enum([ ... ])` the new action `A.AbcdAction`
   3. Add to `export const Actions = { schemas: { ... } }` a new zod schema `AbcdAction: <zod schema>`. This schema is used to validate the response from the model. Must match the one given in the `./src/domain/actions/AbcdAction` file to work
   4. Add a getter to `class Api { ... }` `public get AbcdAction() { ... }`. Return a `new StandardAction({ ... })` with the following:
        ```typescript
        return new AbcdAction({
            type: A.AbcdAction,
            schema: Actions.schemas.AbcdAction,
            contextPath: "actions/AbcdAction",
            examples: ActionExamples.AbcdAction,
            action: async (context: z.infer<typeof Actions.Schemas.AbcdAction>) => {
                // your action goes here. The return type should be:
                return {
                    message: "SUCCESS" // anything else for the model to try again.
                }
            }
        })
        ```
        If you would like the action to return some data, you can do so by:
        ```typescript
        interface AbcdActionResponse {
            thisIs: string;
            theResponse: {
                data: string;
                youCan: number;
                customizeAnyWayYouWant: boolean;
            }
        }

        return new AbcdAction<AbcdActionResponse>({
            type: A.AbcdAction,
            schema: Actions.schemas.AbcdAction,
            contextPath: "actions/AbcdAction",
            examples: ActionExamples.AbcdAction,
            action: async (context: z.infer<typeof Actions.Schemas.AbcdAction>) => {
                const info: AbcdActionResponse = getThisDataFromSomewhere();

                return {
                    // This data should be returned here:
                    data: info,
                    message: "SUCCESS"
                }
            }
        })
        ```
5. Modify the `./src/main.ts` express `POST /actions` handler. Simply add a case to the switch statement:
    ```typescript
    case A.AbcdAction: {
        await api.AbcdAction.run(req, res);
        break;
    }
    ```
6. Modify `./src/domain/actions/WriteTaskList` action context, so the Organizer bot can make use of your new action.
