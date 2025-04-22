/**
 * @fileOverview Point d'entrée pour l'importation des flux AI en développement.
 * Ce fichier importe tous les flux Genkit définis pour les rendre disponibles
 * lors de l'exécution de l'interface utilisateur de développement de Genkit.
 */

// Importe le flux pour suggérer la taille
import '@/ai/flows/suggest-pruning.ts';
// Importe le flux pour identifier les espèces
import '@/ai/flows/identify-species.ts';
//Importe le flux pour suggérer les soins
import '@/ai/flows/suggest-care.ts';
