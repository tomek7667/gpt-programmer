import { z } from "zod";
import { search, SearchResultNode } from "google-sr";
import { Actions, Action, Example, formatWrap } from ".";
import { StandardAction } from "..";

const examples: Example[] = [
	{
		role: "user",
		content: "Find pocketbase documentation",
	},
	{
		role: "assistant",
		content: formatWrap({
			query: "Pocketbase docs url",
		}),
	},
	{
		role: "user",
		content: "Popular developer blogs",
	},
	{
		role: "assistant",
		content: formatWrap({
			query: "programming, developer blogs, best blogs for developers",
		}),
	},
	{
		role: "user",
		content: "Gaming channels",
	},
	{
		role: "assistant",
		content: formatWrap({
			query: "youtube, gaming channels, best gaming channels",
		}),
	},
];

export interface Link {
	url: string;
	title: string;
	description: string;
}

export const GetLinks = () => {
	return new StandardAction<Link[]>({
		type: Actions.GetLinks,
		schema: Action.Schemas.GetLinks,
		contextPath: "contexts/GetLinks",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.GetLinks>) => {
			try {
				const results = (await search(content)) as SearchResultNode[];
				return {
					data: results.map(({ link, description, title }) => ({
						url: link,
						title,
						description,
					})),
					message: "SUCCESS",
				};
			} catch (err: any) {
				console.log(err);
				throw new Error(err);
			}
		},
	});
};
