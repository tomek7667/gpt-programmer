import { z } from "zod";
import { Actions, Action, Example, formatWrap } from ".";
import { api, StandardAction } from "..";

const examples: Example[] = [
	{
		role: "user",
		content:
			"Finish style food - url: https://www.reddit.com/r/Finland/comments/150z8ag/can_yall_recommend_some_simple_tasty_finnish/ - description: Can y'all recommend some simple, tasty Finnish dishes?",
	},
	{
		role: "assistant",
		content: formatWrap({
			link: "https://www.reddit.com/r/Finland/comments/150z8ag/can_yall_recommend_some_simple_tasty_finnish/",
		}),
	},
	{
		role: "user",
		content: "What is this? google.com?",
	},
	{
		role: "assistant",
		content: formatWrap({
			link: "https://google.com/",
		}),
	},
	{
		role: "user",
		content:
			"What is at https://butternutbakeryblog.com/easy-homemade-cinnamon-rolls/ ?",
	},
	{
		role: "assistant",
		content: formatWrap({
			link: "https://butternutbakeryblog.com/easy-homemade-cinnamon-rolls/",
		}),
	},
];

export interface Website {
	content: string;
}

export const VisitLink = () => {
	return new StandardAction<Website>({
		type: Actions.VisitLink,
		schema: Action.Schemas.VisitLink,
		contextPath: "contexts/VisitLink",
		examples,
		action: async (content: z.infer<typeof Action.Schemas.VisitLink>) => {
			try {
				const response = await fetch(content.link, {
					method: "GET",
				});
				const text = await response.text();
				const extracted = text.match(/<body([\s\S]*?)<\/body>/);
				let raw: string;
				if (!extracted) {
					raw = text;
				} else {
					raw = extracted[1];
				}
				const summarized = await api.summarizer.summarize(text);
				return {
					data: {
						content: summarized,
					},
					message: "SUCCESS",
				};
			} catch (err: any) {
				console.log(err);
				throw new Error(err);
			}
		},
	});
};
