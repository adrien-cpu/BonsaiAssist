'use server';

/**
 * @fileOverview Provides care suggestions based on the identified bonsai species,
 * current season, and the tree's health.
 *
 * - suggestCare - A function that suggests specific care actions.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestCareInputSchema = z.object({
  species: z.string().describe('The identified species of the bonsai.'),
  currentSeason: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
  treeHealth: z.string().describe('Description of the current health of the bonsai.'),
});
export type SuggestCareInput = z.infer<typeof SuggestCareInputSchema>;

const SuggestCareOutputSchema = z.object({
  careSuggestions: z.string().describe('Suggestions for providing care for the bonsai, including watering, fertilization, and light exposure.'),
});
export type SuggestCareOutput = z.infer<typeof SuggestCareOutputSchema>;

export async function suggestCare(input: SuggestCareInput): Promise<SuggestCareOutput> {
  return suggestCareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCarePrompt',
  input: {
    schema: z.object({
      species: z.string().describe('The identified species of the bonsai.'),
      currentSeason: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
      treeHealth: z.string().describe('Description of the current health of the bonsai.'),
    }),
  },
  output: {
    schema: z.object({
      careSuggestions: z.string().describe('Suggestions for providing care for the bonsai, including watering, fertilization, and light exposure.'),
    }),
  },
  prompt: `You are an expert bonsai caretaker. Based on the species of the bonsai, the current season, and the tree's health, provide specific care suggestions.

Species: {{{species}}}
Current Season: {{{currentSeason}}}
Tree Health: {{{treeHealth}}}

Care Suggestions:`,
});

const suggestCareFlow = ai.defineFlow<
  typeof SuggestCareInputSchema,
  typeof SuggestCareOutputSchema
>(
  {
    name: 'suggestCareFlow',
    inputSchema: SuggestCareInputSchema,
    outputSchema: SuggestCareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
