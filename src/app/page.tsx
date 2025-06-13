"use client";

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '@/components/layout/navigation';
import { DashboardStats } from '@/components/bonsai/dashboard-stats';
import { CareCalendar } from '@/components/bonsai/care-calendar';
import { WeatherWidget } from '@/components/bonsai/weather-widget';
import { PruningGuide } from '@/components/bonsai/pruning-guide';
import { SpeciesCard } from '@/components/bonsai/species-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useBonsaiData } from '@/hooks/use-bonsai-data';
import { useWeather } from '@/hooks/use-weather';
import { identifySpecies, type IdentifySpeciesOutput } from '@/ai/flows/identify-species';
import { suggestPruning, type SuggestPruningOutput } from '@/ai/flows/suggest-pruning';
import { suggestCare, type SuggestCareOutput } from '@/ai/flows/suggest-care';
import { BonsaiSpecies, CareReminder } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Mock species data
const mockSpecies: BonsaiSpecies[] = [
  {
    id: '1',
    scientificName: 'Acer palmatum',
    commonName: 'Érable japonais',
    family: 'Aceraceae',
    characteristics: ['Feuilles palmées', 'Couleurs automnales spectaculaires', 'Croissance modérée'],
    careLevel: 'intermediate',
    growthRate: 'medium',
    lightRequirements: 'medium',
    wateringFrequency: 'Tous les 2-3 jours',
    optimalTemperature: { min: 15, max: 25 },
    optimalHumidity: { min: 40, max: 60 },
    soilType: 'Bien drainé, légèrement acide',
    fertilizer: 'Engrais équilibré au printemps',
    pruningSeasons: ['Printemps', 'Automne'],
    commonIssues: ['Brûlure des feuilles', 'Pucerons'],
    tips: ['Protéger du soleil direct en été', 'Arroser régulièrement mais sans excès'],
  },
  {
    id: '2',
    scientificName: 'Ficus retusa',
    commonName: 'Ficus Ginseng',
    family: 'Moraceae',
    characteristics: ['Racines aériennes', 'Feuilles persistantes', 'Très résistant'],
    careLevel: 'beginner',
    growthRate: 'fast',
    lightRequirements: 'medium',
    wateringFrequency: 'Tous les 3-4 jours',
    optimalTemperature: { min: 18, max: 30 },
    optimalHumidity: { min: 50, max: 70 },
    soilType: 'Terreau universel bien drainé',
    fertilizer: 'Engrais liquide mensuel',
    pruningSeasons: ['Toute l\'année'],
    commonIssues: ['Chute des feuilles', 'Cochenilles'],
    tips: ['Peut être cultivé en intérieur', 'Tailler régulièrement pour maintenir la forme'],
  },
];

export default function IndexPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Identification states
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [speciesDescription, setSpeciesDescription] = useState('');
  const [identificationResult, setIdentificationResult] = useState<IdentifySpeciesOutput | null>(null);
  
  // Pruning states
  const [pruningGoals, setPruningGoals] = useState('');
  const [treeStructure, setTreeStructure] = useState('');
  const [pruningSuggestions, setPruningSuggestions] = useState<SuggestPruningOutput | null>(null);
  
  // Care states
  const [currentSeason, setCurrentSeason] = useState('');
  const [treeHealth, setTreeHealth] = useState('');
  const [careSuggestions, setCareSuggestions] = useState<SuggestCareOutput | null>(null);
  
  // Camera states
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  // Hooks
  const { bonsaiProfiles, careReminders, addCareReminder, updateCareReminder } = useBonsaiData();
  const { weather } = useWeather('Paris'); // Default to Paris

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Camera functions
  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraEnabled(true);
      toast({
        title: 'Caméra activée',
        description: 'Vous pouvez maintenant prendre des photos de vos bonsaïs.',
      });
    } catch (err) {
      console.error('Camera error:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les autorisations.');
      toast({
        variant: 'destructive',
        title: 'Erreur caméra',
        description: 'Impossible d\'accéder à la caméra.',
      });
    }
  };

  // AI functions
  const handleIdentifySpecies = async () => {
    if (!photoUrl && !speciesDescription) {
      setError('Veuillez fournir une photo ou une description.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await identifySpecies({
        photoUrl: photoUrl || '',
        description: speciesDescription,
      });
      setIdentificationResult(result);
      toast({
        title: 'Espèce identifiée',
        description: `${result.species} avec ${Math.round(result.confidence * 100)}% de confiance.`,
      });
    } catch (err) {
      console.error('Identification error:', err);
      setError('Erreur lors de l\'identification. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestPruning = async () => {
    if (!identificationResult?.species) {
      setError('Veuillez d\'abord identifier l\'espèce.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await suggestPruning({
        species: identificationResult.species,
        userGoals: pruningGoals,
        treeStructure,
        bonsaiDescription: speciesDescription,
      });
      setPruningSuggestions(result);
      
      toast({
        title: 'Suggestions de taille générées',
        description: 'Consultez le guide de taille pour les instructions détaillées.',
      });
    } catch (err) {
      console.error('Pruning suggestion error:', err);
      setError('Erreur lors de la génération des suggestions de taille.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestCare = async () => {
    if (!identificationResult?.species) {
      setError('Veuillez d\'abord identifier l\'espèce.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await suggestCare({
        species: identificationResult.species,
        currentSeason,
        treeHealth,
      });
      setCareSuggestions(result);
      toast({
        title: 'Suggestions de soins générées',
        description: 'Consultez les recommandations personnalisées.',
      });
    } catch (err) {
      console.error('Care suggestion error:', err);
      setError('Erreur lors de la génération des suggestions de soins.');
    } finally {
      setIsLoading(false);
    }
  };

  // Page rendering functions
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre collection de bonsaïs
        </p>
      </div>

      <DashboardStats 
        bonsaiProfiles={bonsaiProfiles} 
        careReminders={careReminders} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weather && (
          <WeatherWidget weather={weather} location="Paris" />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.bell className="h-5 w-5" />
              Prochains soins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {careReminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-3 py-2">
                <Icons.droplets className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reminder.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" size="sm">
                  {reminder.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderIdentification = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identification d'espèces</h1>
        <p className="text-muted-foreground">
          Utilisez l'IA pour identifier votre bonsaï
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identifier votre bonsaï</CardTitle>
          <CardDescription>
            Prenez une photo ou décrivez votre bonsaï pour l'identifier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="camera" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Caméra</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Utilisez votre caméra pour prendre une photo
                </p>
                <Button
                  variant="outline"
                  onClick={enableCamera}
                  disabled={isCameraEnabled}
                >
                  <Icons.camera className="h-4 w-4 mr-2" />
                  {isCameraEnabled ? 'Caméra active' : 'Activer caméra'}
                </Button>
              </div>

              {isCameraEnabled && (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Aperçu caméra</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="description" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">URL de l'image</label>
                  <Input
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                    value={photoUrl || ''}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description du bonsaï</label>
                  <Textarea
                    placeholder="Décrivez les caractéristiques de votre bonsaï..."
                    value={speciesDescription}
                    onChange={(e) => setSpeciesDescription(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <Icons.alert className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleIdentifySpecies}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Icons.search className="h-4 w-4 mr-2" />
            )}
            Identifier l'espèce
          </Button>
        </CardContent>
      </Card>

      {identificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat de l'identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{identificationResult.species}</h3>
                <p className="text-sm text-muted-foreground">
                  Confiance: {Math.round(identificationResult.confidence * 100)}%
                </p>
              </div>
              <p className="text-sm">{identificationResult.characteristics}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockSpecies.map((species) => (
          <SpeciesCard
            key={species.id}
            species={species}
            onClick={() => {
              setIdentificationResult({
                species: species.commonName,
                confidence: 0.95,
                characteristics: species.characteristics.join(', '),
              });
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderPruning = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guide de taille</h1>
        <p className="text-muted-foreground">
          Obtenez des conseils personnalisés pour tailler vos bonsaïs
        </p>
      </div>

      {!identificationResult && (
        <Alert>
          <Icons.info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Veuillez d'abord identifier votre bonsaï dans la section "Identifier".
          </AlertDescription>
        </Alert>
      )}

      {identificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de taille</CardTitle>
            <CardDescription>
              Décrivez vos objectifs pour obtenir des suggestions personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Structure actuelle de l'arbre</label>
              <Textarea
                placeholder="Décrivez la structure et le placement des branches..."
                value={treeStructure}
                onChange={(e) => setTreeStructure(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Objectifs de taille</label>
              <Textarea
                placeholder="Quels sont vos objectifs ? (forme, santé, style...)"
                value={pruningGoals}
                onChange={(e) => setPruningGoals(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSuggestPruning}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icons.scissors className="h-4 w-4 mr-2" />
              )}
              Générer les suggestions
            </Button>
          </CardContent>
        </Card>
      )}

      {pruningSuggestions && (
        <PruningGuide
          suggestions={pruningSuggestions}
          onApplyPruning={(branchId) => {
            console.log('Applying pruning to branch:', branchId);
            toast({
              title: 'Taille appliquée',
              description: 'La branche a été marquée comme taillée.',
            });
          }}
          onSaveSession={() => {
            toast({
              title: 'Session sauvegardée',
              description: 'Votre session de taille a été enregistrée.',
            });
          }}
        />
      )}
    </div>
  );

  const renderCare = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Soins et calendrier</h1>
        <p className="text-muted-foreground">
          Planifiez et suivez les soins de vos bonsaïs
        </p>
      </div>

      <CareCalendar
        reminders={careReminders}
        onReminderClick={(reminder) => {
          console.log('Reminder clicked:', reminder);
        }}
        onDateSelect={(date) => {
          console.log('Date selected:', date);
        }}
      />

      {identificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions de soins personnalisées</CardTitle>
            <CardDescription>
              Obtenez des conseils adaptés à votre bonsaï et à la saison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Saison actuelle</label>
                <Input
                  placeholder="ex: Printemps"
                  value={currentSeason}
                  onChange={(e) => setCurrentSeason(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">État de santé</label>
                <Textarea
                  placeholder="Décrivez l'état actuel de votre bonsaï..."
                  value={treeHealth}
                  onChange={(e) => setTreeHealth(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSuggestCare}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icons.droplets className="h-4 w-4 mr-2" />
              )}
              Générer les suggestions de soins
            </Button>
          </CardContent>
        </Card>
      )}

      {careSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Recommandations de soins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{careSuggestions.careSuggestions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visualisation 3D</h1>
        <p className="text-muted-foreground">
          Interagissez avec le modèle 3D de votre bonsaï
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modèle 3D interactif</CardTitle>
          <CardDescription>
            Visualisez votre bonsaï en 3D et les zones de taille suggérées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video border rounded-lg overflow-hidden bg-muted">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Icons.spinner className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement du modèle 3D...</p>
              </div>
            </div>
          </div>

          {pruningSuggestions && (
            <div className="mt-4">
              <Button>
                <Icons.eye className="h-4 w-4 mr-2" />
                Afficher les zones de taille
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'identify':
        return renderIdentification();
      case 'pruning':
        return renderPruning();
      case 'care':
        return renderCare();
      case 'visualization':
        return renderVisualization();
      default:
        return renderDashboard();
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <SidebarInset className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {renderCurrentPage()}
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}