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
}

export const GetLinks = () => {
	return new StandardAction<Link[]>({
		type: Actions.GetLinks,
		schema: Action.Schemas.GetLinks,
		contextPath: "contexts/GetLinks",
		examples,
		action: async (
			content: z.infer<typeof Action.Schemas.GetLinks>
		): Promise<{
			message: string;
			data: Link[];
		}> => {
			try {
				const results = (await search(content)) as SearchResultNode[];
				return {
					data: results.map(({ link, title }) => ({
						url: link,
						title,
					})),
					message: "SUCCESS",
				};
			} catch (err: any) {
				if (err?.response?.status === 429) {
					console.log("Rate limited, retrying in 15 seconds");
					await new Promise((resolve) => setTimeout(resolve, 15_000));
					throw new Error(
						"The request was rate limited. Retrying..."
					);
				}
				throw new Error(err);
			}
		},
	});
};
