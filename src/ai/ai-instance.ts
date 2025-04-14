/**
 * @fileOverview Instance de configuration pour Genkit AI.
 * Ce fichier configure et exporte l'instance Genkit utilisée dans l'application.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * Instance Genkit configurée.
 * @type {import('genkit').Genkit}
 * @description Initialise Genkit avec les plugins nécessaires (Google AI) et la configuration du modèle.
 * Utilise la clé API Google GenAI depuis les variables d'environnement.
 */
export const ai = genkit({
  promptDir: './prompts', // Répertoire pour stocker les prompts (si utilisé)
  plugins: [
    googleAI({
      // Récupère la clé API depuis les variables d'environnement
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Modèle d'IA spécifique à utiliser
});
