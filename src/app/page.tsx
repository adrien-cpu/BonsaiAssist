'use client';
/**
 * @fileOverview Composant principal de la page d'accueil de l'application BonsAI Assist.
 * Permet à l'utilisateur d'identifier une espèce de bonsaï et d'accéder à d'autres fonctionnalités.
 */

import React, {
  useState
} from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { identifySpecies, IdentifySpeciesOutput } from '@/ai/flows/identify-species';

/**
 * Composant de la page d'accueil.
 * Gère l'état et l'interaction pour l'identification des espèces, la visualisation 3D et la navigation.
 * @returns {JSX.Element} Le composant de la page d'accueil.
 */
export default function Home() {
  // État pour contrôler la visibilité de la vue 3D
  const [is3DViewEnabled, set3DViewEnabled] = useState(false);
  // État pour stocker l'URL de l'image fournie par l'utilisateur
  const [imageUrl, setImageUrl] = useState('');
  // État pour stocker la description fournie par l'utilisateur
  const [description, setDescription] = useState('');
  // État pour stocker le résultat de l'identification
  const [identificationResult, setIdentificationResult] = useState<IdentifySpeciesOutput | null>(null);
  // État pour indiquer si une opération d'identification est en cours
  const [isLoading, setIsLoading] = useState(false);
  // État pour stocker les messages d'erreur potentiels
  const [error, setError] = useState<string | null>(null);

  /**
   * Fonction placeholder pour la fonctionnalité de guide de taille.
   * @returns {void}
   */
  const getPruningGuidance = () => {
    alert('La fonctionnalité de guide de taille sera bientôt disponible !');
  };

  /**
   * Bascule la visibilité de la section de visualisation 3D.
   * @returns {void}
   */
  const toggle3DView = () => {
    set3DViewEnabled(!is3DViewEnabled);
  };

  /**
   * Gère le processus d'identification des espèces.
   * Appelle le flux AI `identifySpecies` et met à jour l'état avec le résultat ou une erreur.
   * @returns {Promise<void>}
   */
  const handleIdentify = async () => {
    setIsLoading(true); // Active l'indicateur de chargement
    setError(null); // Réinitialise les erreurs précédentes
    setIdentificationResult(null); // Réinitialise les résultats précédents
    try {
      // Appelle la fonction d'identification de l'IA
      const result = await identifySpecies({ photoUrl: imageUrl, description });
      setIdentificationResult(result); // Met à jour l'état avec le résultat
    } catch (err: any) {
      console.error('Erreur lors de l\'identification de l\'espèce :', err);
      setError('Échec de l\'identification de l\'espèce. Veuillez vérifier les entrées et réessayer.'); // Met à jour l'état d'erreur
    }
    setIsLoading(false); // Désactive l'indicateur de chargement
  };

  return (
    // Fournisseur de contexte pour la barre latérale
    <SidebarProvider>
      {/* Conteneur principal avec padding à gauche pour la barre latérale sur les écrans moyens et plus grands */}
      <div className="md:pl-64">
        {/* Barre latérale */}
        <Sidebar
          collapsible="icon" // Permet de réduire la barre latérale en icônes
          width="w-64" // Largeur de la barre latérale
          style={{ background: '#F0EAD6' }} // Couleur de fond beige clair
        >
          <SidebarHeader>
            {/* Bouton pour afficher/masquer la barre latérale sur les petits écrans */}
            <SidebarTrigger>
              <Button variant="ghost" size="sm">
                Basculer la Sidebar
              </Button>
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              {/* Titre de l'application dans la barre latérale */}
              <SidebarGroupLabel className="text-[#386641]">BonsAI Assist</SidebarGroupLabel> {/* Vert terreux */}
              <SidebarMenu>
                {/* Élément de menu pour l'identification des espèces (actuellement affiché comme titre) */}
                <SidebarMenuItem>
                  <span className="font-semibold text-[#386641]">Identifier l'espèce</span>
                </SidebarMenuItem>
                {/* Bouton de menu pour obtenir le guide de taille */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={getPruningGuidance}>
                    Guide de taille
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Bouton de menu pour basculer la visualisation 3D */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggle3DView}>
                    Visualisation 3D
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        {/* Contenu principal de la page */}
        <div className="md:p-6 flex flex-col">
          {/* Titre principal de la section */}
          <h1 className="text-2xl font-bold text-[#386641] mb-4">Identifiez votre Bonsaï</h1>

          {/* Carte pour les entrées utilisateur (URL de l'image et description) */}
          <Card className="mb-6 bg-white shadow-md">
            <CardHeader>
              <CardTitle>Détails d'entrée</CardTitle>
              <CardDescription>Fournissez l'URL d'une image et une description de votre bonsaï.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Champ pour l'URL de l'image */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://exemple.com/bonsai.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    aria-label="URL de l'image du Bonsaï"
                    required // Ajout pour l'accessibilité et la validation
                  />
                </div>
                {/* Champ pour la description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre bonsaï (ex : forme des feuilles, texture du tronc)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-label="Description du Bonsaï"
                    rows={4}
                    required // Ajout pour l'accessibilité et la validation
                  />
                </div>
                {/* Bouton pour lancer l'identification */}
                <Button
                    onClick={handleIdentify}
                    disabled={isLoading || !imageUrl || !description} // Désactivé si chargement en cours ou champs vides
                    className="bg-[#386641] text-white hover:bg-[#2f5235] disabled:opacity-50"
                    aria-live="polite" // Informe les lecteurs d'écran des changements (ex: texte du bouton)
                  >
                  {isLoading ? 'Identification en cours...' : 'Identifier l\'espèce'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Affichage de la carte d'erreur si une erreur survient */}
          {error && (
            <Card className="mb-6 border-red-500 bg-red-50">
              <CardHeader>
                  <CardTitle className="text-red-700">Erreur</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Affichage de la carte de résultat si l'identification réussit */}
          {identificationResult && (
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-[#386641]">Résultat de l'identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">Espèce :</h3>
                  <p>{identificationResult.species}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Confiance :</h3>
                  <p>{(identificationResult.confidence * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <h3 className="font-semibold">Caractéristiques :</h3>
                  <p>{identificationResult.characteristics}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section pour la visualisation 3D (conditionnellement affichée) */}
          {is3DViewEnabled && (
            <div className="mt-6">
               <Card className="bg-white shadow-md">
                 <CardHeader>
                    <CardTitle className="text-[#386641]">Visualisation 3D</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder pour la visualisation 3D */}
                    <img
                      src="https://picsum.photos/seed/bonsai3d/400/300" // URL de l'image placeholder
                      alt="Visualisation 3D du Bonsaï"
                      className="rounded-md shadow-inner w-full h-auto"
                      aria-labelledby="viz-3d-title" // Lie l'image à son titre pour l'accessibilité
                    />
                    <p id="viz-3d-title" className="text-sm text-gray-500 mt-2">
                      Placeholder de la visualisation 3D.
                    </p>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

