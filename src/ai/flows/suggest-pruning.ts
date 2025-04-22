
'use server';
/**
 * @fileOverview Provides pruning suggestions based on the identified bonsai species and user's goals.
 *
 * - suggestPruning - A function that suggests which branches to prune.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestPruningInputSchema = z.object({
  species: z.string().describe('The identified species of the bonsai.'),
  userGoals: z.string().describe('The user\u2019s goals for the bonsai (e.g., shaping, health).'),
  treeStructure: z.string().optional().describe('Description of the tree structure and branch placement'),
  bonsaiDescription: z.string().optional().describe('A description of the current state of the bonsai.'),
});
export type SuggestPruningInput = z.infer<typeof SuggestPruningInputSchema>;

const SuggestPruningOutputSchema = z.object({
  pruningSuggestions: z.string().describe('Suggestions for which branches to prune and how to shape the bonsai.'),
  branchIdentifications: z.string().describe('Identifications of specific branches to prune'),
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
      treeStructure: z.string().optional().describe('Description of the tree structure and branch placement'),
      bonsaiDescription: z.string().optional().describe('A description of the current state of the bonsai.'),
    }),
  },
  output: {
    schema: z.object({
      pruningSuggestions: z.string().describe('Suggestions for which branches to prune and how to shape the bonsai.'),
      branchIdentifications: z.string().describe('Identifications of specific branches to prune'),
    }),
  },
  prompt: `You are an expert bonsai artist. Based on the species of the bonsai, the user's goals, the tree structure, and a description of the bonsai, provide specific pruning suggestions and identify specific branches to prune.

Species: {{{species}}}
User Goals: {{{userGoals}}}
Tree Structure: {{{treeStructure}}}
Description of Bonsai: {{{bonsaiDescription}}}

Pruning Suggestions: Provide detailed pruning actions to be taken, including specific locations of cuts to make, techniques for shaping the tree, and consider aesthetics.
Branch Identifications: Provide a numbered list of specific branches that should be pruned.
`,
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
