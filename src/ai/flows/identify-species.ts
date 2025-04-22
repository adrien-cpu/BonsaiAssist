'use server';
/**
 * @fileOverview Identifies the species of a bonsai tree from an image and description.
 *
 * - identifySpecies - A function that handles the species identification process.
 * - IdentifySpeciesInput - The input type for the identifySpecies function.
 * - IdentifySpeciesOutput - The return type for the IdentifySpecies function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifySpeciesInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the bonsai photo.'),
  description: z.string().describe('The description of the bonsai.'),
});
export type IdentifySpeciesInput = z.infer<typeof IdentifySpeciesInputSchema>;

const IdentifySpeciesOutputSchema = z.object({
  species: z.string().describe('The identified species of the bonsai.'),
  confidence: z.number().describe('The confidence level of the identification (0-1).'),
  characteristics: z.string().describe('Key characteristics of the identified species.'),
});
export type IdentifySpeciesOutput = z.infer<typeof IdentifySpeciesOutputSchema>;

export async function identifySpecies(input: IdentifySpeciesInput): Promise<IdentifySpeciesOutput> {
  return identifySpeciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifySpeciesPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the bonsai photo.'),
      description: z.string().describe('The description of the bonsai.'),
    }),
  },
  output: {
    schema: z.object({
      species: z.string().describe('The identified species of the bonsai.'),
      confidence: z.number().describe('The confidence level of the identification (0-1).'),
      characteristics: z.string().describe('Key characteristics of the identified species.'),
    }),
  },
  prompt: `You are an expert botanist specializing in identifying bonsai species.

You will use this information to identify the species of the bonsai.

Description: {{{description}}}
Photo: {{media url=photoUrl}}

Respond with the species, your confidence, and key characteristics.`, // Ensure the model outputs in a structured format
});

const identifySpeciesFlow = ai.defineFlow<
  typeof IdentifySpeciesInputSchema,
  typeof IdentifySpeciesOutputSchema
>(
  {
    name: 'identifySpeciesFlow',
    inputSchema: IdentifySpeciesInputSchema,
    outputSchema: IdentifySpeciesOutputSchema,
  },
  async input => {
    // Remove "data:" prefix from photoUrl
    const cleanedPhotoUrl = input.photoUrl.replace(/^data:[^;]+;base64,/, '');
    const {output} = await prompt({...input, photoUrl: cleanedPhotoUrl});
    return output!;
  }
);
