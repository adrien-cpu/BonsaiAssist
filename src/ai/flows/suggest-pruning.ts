// noinspection JSUnusedLocalSymbols
'use server';
/**
 * @fileOverview Provides pruning suggestions based on the identified bonsai species and user's goals.
 *
 * - suggestPruning - A function that suggests which branches to prune.
 * - SuggestPruningInput - The input type for the suggestPruning function.
 * - SuggestPruningOutput - The return type for the suggestPruning function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestPruningInputSchema = z.object({
  species: z.string().describe('The identified species of the bonsai.'),
  userGoals: z.string().describe('The user\u2019s goals for the bonsai (e.g., shaping, health).'),
  bonsaiDescription: z.string().optional().describe('A description of the current state of the bonsai.'),
});
export type SuggestPruningInput = z.infer<typeof SuggestPruningInputSchema>;

const SuggestPruningOutputSchema = z.object({
  pruningSuggestions: z.string().describe('Suggestions for which branches to prune and how to shape the bonsai.'),
});
export type SuggestPruningOutput = z.infer<typeof SuggestPruningOutputSchema>;

export async function suggestPruning(input: SuggestPruningInput): Promise<SuggestPruningOutput> {
  return suggestPruningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPruningPrompt',
  input: {
    schema: z.object({
      species: z.string().describe('The identified species of the bonsai.'),
      userGoals: z.string().describe('The user\u2019s goals for the bonsai (e.g., shaping, health).'),
      bonsaiDescription: z.string().optional().describe('A description of the current state of the bonsai.'),
    }),
  },
  output: {
    schema: z.object({
      pruningSuggestions: z.string().describe('Suggestions for which branches to prune and how to shape the bonsai.'),
    }),
  },
  prompt: `You are an expert bonsai artist. Based on the species of the bonsai, the user's goals, and a description of the bonsai, provide specific pruning suggestions.

Species: {{{species}}}
User Goals: {{{userGoals}}}
Description of Bonsai: {{{bonsaiDescription}}}

Pruning Suggestions:`,
});

const suggestPruningFlow = ai.defineFlow<
  typeof SuggestPruningInputSchema,
  typeof SuggestPruningOutputSchema
>(
  {
    name: 'suggestPruningFlow',
    inputSchema: SuggestPruningInputSchema,
    outputSchema: SuggestPruningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
