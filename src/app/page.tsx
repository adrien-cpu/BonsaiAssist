'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/navigation';
import { DashboardStats } from '@/components/bonsai/dashboard-stats';
import { CareCalendar } from '@/components/bonsai/care-calendar';
import { WeatherWidget } from '@/components/bonsai/weather-widget';
import { PruningGuide } from '@/components/bonsai/pruning-guide';
import { SpeciesCard } from '@/components/bonsai/species-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useBonsaiData } from '@/hooks/use-bonsai-data';
import { useWeather } from '@/hooks/use-weather';
import { identifySpecies } from '@/ai/flows/identify-species';
import { suggestPruning } from '@/ai/flows/suggest-pruning';
import { suggestCare } from '@/ai/flows/suggest-care';
import { BonsaiProfile, BonsaiSpecies, CareReminder, WeatherData } from '@/types';

// Mock data pour les espèces
const mockSpecies: BonsaiSpecies[] = [
  {
    id: '1',
    scientificName: 'Acer palmatum',
    commonName: 'Érable japonais',
    family: 'Aceraceae',
    characteristics: ['Feuilles palmées', 'Couleurs automnales', 'Croissance lente'],
    careLevel: 'intermediate',
    growthRate: 'slow',
    lightRequirements: 'medium',
    wateringFrequency: 'Tous les 2-3 jours',
    optimalTemperature: { min: 15, max: 25 },
    optimalHumidity: { min: 40, max: 60 },
    soilType: 'Akadama mélangé',
    fertilizer: 'Engrais liquide dilué',
    pruningSeasons: ['Printemps', 'Automne'],
    commonIssues: ['Brûlure des feuilles', 'Pucerons'],
    tips: ['Protéger du soleil direct en été', 'Arroser régulièrement']
  },
  {
    id: '2',
    scientificName: 'Ficus retusa',
    commonName: 'Ficus Ginseng',
    family: 'Moraceae',
    characteristics: ['Racines aériennes', 'Feuilles brillantes', 'Croissance rapide'],
    careLevel: 'beginner',
    growthRate: 'fast',
    lightRequirements: 'medium',
    wateringFrequency: 'Tous les 3-4 jours',
    optimalTemperature: { min: 18, max: 30 },
    optimalHumidity: { min: 50, max: 70 },
    soilType: 'Terreau universel',
    fertilizer: 'Engrais pour bonsaï',
    pruningSeasons: ['Toute l\'année'],
    commonIssues: ['Chute des feuilles', 'Cochenilles'],
    tips: ['Peut être cultivé en intérieur', 'Tailler régulièrement']
  }
];

// Mock weather data
const mockWeather: WeatherData = {
  temperature: 22,
  humidity: 65,
  conditions: 'Partiellement nuageux',
  uvIndex: 6,
  windSpeed: 12,
  pressure: 1013,
  forecast: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      temperature: { min: 18, max: 25 },
      conditions: 'Ensoleillé',
      humidity: 60,
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      temperature: { min: 16, max: 23 },
      conditions: 'Nuageux',
      humidity: 70,
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      temperature: { min: 19, max: 26 },
      conditions: 'Pluie',
      humidity: 85,
    },
  ],
};

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [identificationResult, setIdentificationResult] = useState<any>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [pruningSuggestions, setPruningSuggestions] = useState<any>(null);
  const [careSuggestions, setCareSuggestions] = useState<any>(null);

  const { bonsaiProfiles, careReminders, saveBonsaiProfile, addCareReminder } = useBonsaiData();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifySpecies = async () => {
    if (!photoPreview || !description) return;

    setIsIdentifying(true);
    try {
      const result = await identifySpecies({
        photoUrl: photoPreview,
        description: description
      });
      setIdentificationResult(result);
    } catch (error) {
      console.error('Erreur lors de l\'identification:', error);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleAddToCollection = () => {
    if (!identificationResult) return;

    const newBonsai: BonsaiProfile = {
      id: Date.now().toString(),
      name: `Mon ${identificationResult.species}`,
      species: identificationResult.species,
      age: 0, // À définir par l'utilisateur
      acquisitionDate: new Date(),
      photos: photoPreview ? [{
        id: Date.now().toString(),
        url: photoPreview,
        date: new Date(),
        type: 'progress'
      }] : [],
      careHistory: [],
      healthStatus: 'good',
      lastWatered: new Date(),
      lastFertilized: new Date(),
      lastPruned: new Date(),
      nextCareDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'outdoor',
      potSize: 'Moyen',
      soilLastChanged: new Date()
    };

    saveBonsaiProfile(newBonsai);
    setCurrentPage('collection');
  };

  const handleGetPruningSuggestions = async (bonsai: BonsaiProfile) => {
    try {
      const result = await suggestPruning({
        species: bonsai.species,
        userGoals: 'Améliorer la forme et la santé',
        bonsaiDescription: `Bonsaï de ${bonsai.age} ans, dernière taille: ${bonsai.lastPruned.toLocaleDateString()}`
      });
      setPruningSuggestions(result);
    } catch (error) {
      console.error('Erreur lors de la suggestion de taille:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button onClick={() => setCurrentPage('identify')}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Identifier un bonsaï
        </Button>
      </div>

      <DashboardStats 
        bonsaiProfiles={bonsaiProfiles} 
        careReminders={careReminders} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget weather={mockWeather} location="Paris, France" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.activity className="h-5 w-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bonsaiProfiles.slice(0, 3).map((bonsai) => (
                <div key={bonsai.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <Icons.tree className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{bonsai.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière activité: {bonsai.lastWatered.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {bonsaiProfiles.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderIdentify = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Identifier une espèce</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.camera className="h-5 w-5" />
              Photo du bonsaï
            </CardTitle>
            <CardDescription>
              Prenez une photo claire de votre bonsaï
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Aperçu" 
                  className="max-w-full h-48 object-cover mx-auto rounded-lg"
                />
              ) : (
                <div className="space-y-2">
                  <Icons.camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Cliquez pour ajouter une photo</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="mt-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Décrivez votre bonsaï (forme des feuilles, couleur, taille...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleIdentifySpecies}
              disabled={!photoPreview || !description || isIdentifying}
              className="w-full"
            >
              {isIdentifying ? (
                <>
                  <Icons.loading className="h-4 w-4 mr-2 animate-spin" />
                  Identification en cours...
                </>
              ) : (
                <>
                  <Icons.search className="h-4 w-4 mr-2" />
                  Identifier l'espèce
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {identificationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.success className="h-5 w-5 text-green-600" />
                Espèce identifiée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{identificationResult.species}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    Confiance: {Math.round(identificationResult.confidence * 100)}%
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Caractéristiques identifiées:</h4>
                <p className="text-sm text-muted-foreground">
                  {identificationResult.characteristics}
                </p>
              </div>

              <Button onClick={handleAddToCollection} className="w-full">
                <Icons.plus className="h-4 w-4 mr-2" />
                Ajouter à ma collection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <h2 className="col-span-full text-xl font-semibold mb-4">Espèces populaires</h2>
        {mockSpecies.map((species) => (
          <SpeciesCard 
            key={species.id} 
            species={species}
            onClick={() => {
              setIdentificationResult({
                species: species.commonName,
                confidence: 0.95,
                characteristics: species.characteristics.join(', ')
              });
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderCollection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ma Collection</h1>
        <Button onClick={() => setCurrentPage('identify')}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Ajouter un bonsaï
        </Button>
      </div>

      {bonsaiProfiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Icons.tree className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun bonsaï dans votre collection</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par identifier votre premier bonsaï
            </p>
            <Button onClick={() => setCurrentPage('identify')}>
              <Icons.camera className="h-4 w-4 mr-2" />
              Identifier mon premier bonsaï
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonsaiProfiles.map((bonsai) => (
            <Card key={bonsai.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {bonsai.photos.length > 0 ? (
                  <img 
                    src={bonsai.photos[0].url} 
                    alt={bonsai.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Icons.tree className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2">
                  {bonsai.healthStatus}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{bonsai.name}</CardTitle>
                <CardDescription>{bonsai.species}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Âge:</span>
                    <span>{bonsai.age} ans</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dernière taille:</span>
                    <span>{bonsai.lastPruned.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emplacement:</span>
                    <span>{bonsai.location}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGetPruningSuggestions(bonsai)}
                  >
                    <Icons.scissors className="h-4 w-4 mr-1" />
                    Tailler
                  </Button>
                  <Button size="sm" variant="outline">
                    <Icons.droplets className="h-4 w-4 mr-1" />
                    Arroser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCare = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Soins</h1>
        <Button>
          <Icons.plus className="h-4 w-4 mr-2" />
          Nouveau rappel
        </Button>
      </div>

      <CareCalendar 
        reminders={careReminders}
        onReminderClick={(reminder) => console.log('Reminder clicked:', reminder)}
        onDateSelect={(date) => console.log('Date selected:', date)}
      />
    </div>
  );

  const renderPruning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guide de taille</h1>
      </div>

      {pruningSuggestions ? (
        <PruningGuide 
          suggestions={pruningSuggestions}
          onApplyPruning={(branchId) => console.log('Apply pruning:', branchId)}
          onSaveSession={() => console.log('Save session')}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Icons.scissors className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune suggestion de taille</h3>
            <p className="text-muted-foreground mb-4">
              Sélectionnez un bonsaï de votre collection pour obtenir des suggestions
            </p>
            <Button onClick={() => setCurrentPage('collection')}>
              <Icons.tree className="h-4 w-4 mr-2" />
              Voir ma collection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visualisation 3D</h1>
      <Card>
        <CardContent className="text-center py-12">
          <Icons.eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Visualisation 3D</h3>
          <p className="text-muted-foreground">
            La visualisation 3D sera bientôt disponible
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Météo</h1>
      <WeatherWidget weather={mockWeather} location="Paris, France" />
    </div>
  );

  const renderTutorials = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tutoriels</h1>
      <Card>
        <CardContent className="text-center py-12">
          <Icons.book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tutoriels</h3>
          <p className="text-muted-foreground">
            Les tutoriels seront bientôt disponibles
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Communauté</h1>
      <Card>
        <CardContent className="text-center py-12">
          <Icons.users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Communauté</h3>
          <p className="text-muted-foreground">
            La communauté sera bientôt disponible
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      <Card>
        <CardContent className="text-center py-12">
          <Icons.settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Paramètres</h3>
          <p className="text-muted-foreground">
            Les paramètres seront bientôt disponibles
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'identify': return renderIdentify();
      case 'collection': return renderCollection();
      case 'care': return renderCare();
      case 'pruning': return renderPruning();
      case 'visualization': return renderVisualization();
      case 'weather': return renderWeather();
      case 'tutorials': return renderTutorials();
      case 'community': return renderCommunity();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Navigation 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
        <SidebarInset>
          <main className="flex-1 p-6">
            {renderCurrentPage()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}