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
import { BonsaiSpecies, CareReminder, BonsaiProfile, Tutorial, CommunityPost } from '@/types';
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

// Mock tutorials data
const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Premiers pas avec les bonsaïs',
    description: 'Apprenez les bases de l\'entretien des bonsaïs',
    difficulty: 'beginner',
    duration: 15,
    category: 'care',
    tools: ['Arrosoir', 'Sécateur'],
    steps: [
      {
        title: 'Choisir l\'emplacement',
        description: 'Placez votre bonsaï dans un endroit lumineux mais sans soleil direct',
        tips: ['Évitez les courants d\'air', 'Maintenez une température stable']
      },
      {
        title: 'Arrosage',
        description: 'Arrosez quand la terre commence à sécher en surface',
        tips: ['Utilisez de l\'eau à température ambiante', 'Arrosez lentement et uniformément']
      }
    ]
  },
  {
    id: '2',
    title: 'Techniques de taille avancées',
    description: 'Maîtrisez l\'art de la taille pour façonner votre bonsaï',
    difficulty: 'advanced',
    duration: 45,
    category: 'pruning',
    tools: ['Sécateur de précision', 'Pince concave', 'Mastic cicatrisant'],
    steps: [
      {
        title: 'Analyser la structure',
        description: 'Observez la forme actuelle et visualisez le résultat souhaité',
        tips: ['Prenez du recul pour avoir une vue d\'ensemble', 'Identifiez les branches principales']
      },
      {
        title: 'Coupes structurelles',
        description: 'Effectuez les coupes importantes pour définir la silhouette',
        tips: ['Coupez toujours au-dessus d\'un bourgeon', 'Utilisez un mastic pour les grosses coupes']
      }
    ]
  }
];

// Mock community posts
const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Marie Dubois',
    title: 'Mon érable après 3 ans de soins',
    content: 'Voici l\'évolution de mon érable japonais. Les couleurs d\'automne sont magnifiques cette année !',
    images: ['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
    tags: ['érable', 'automne', 'progression'],
    likes: 24,
    comments: 8,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'showcase'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Pierre Martin',
    title: 'Aide : feuilles qui jaunissent',
    content: 'Mon ficus perd ses feuilles depuis quelques jours. Quelqu\'un a-t-il déjà eu ce problème ?',
    images: [],
    tags: ['ficus', 'problème', 'feuilles'],
    likes: 12,
    comments: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: 'help'
  }
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
  
  // Collection states
  const [showAddBonsaiForm, setShowAddBonsaiForm] = useState(false);
  const [newBonsaiAge, setNewBonsaiAge] = useState<number>(1);
  const [newBonsaiName, setNewBonsaiName] = useState('');
  const [newBonsaiLocation, setNewBonsaiLocation] = useState<'indoor' | 'outdoor' | 'greenhouse'>('indoor');
  const [selectedBonsai, setSelectedBonsai] = useState<BonsaiProfile | null>(null);
  
  // Tutorial states
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Community states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'showcase' | 'help' | 'tutorial' | 'discussion'>('showcase');
  
  // Hooks
  const { bonsaiProfiles, careReminders, addCareReminder, updateCareReminder, saveBonsaiProfile } = useBonsaiData();
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

  // Collection functions
  const handleAddToCollection = () => {
    if (!identificationResult) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Aucune espèce identifiée à ajouter.',
      });
      return;
    }

    setShowAddBonsaiForm(true);
  };

  const handleSaveToCollection = () => {
    if (!identificationResult || !newBonsaiName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    const newBonsai: BonsaiProfile = {
      id: Date.now().toString(),
      name: newBonsaiName.trim(),
      species: identificationResult.species,
      age: newBonsaiAge,
      acquisitionDate: new Date(),
      photos: [],
      careHistory: [{
        date: new Date(),
        action: 'Ajout à la collection',
        notes: `Bonsaï identifié avec ${Math.round(identificationResult.confidence * 100)}% de confiance`,
      }],
      healthStatus: 'good',
      lastWatered: new Date(),
      lastFertilized: new Date(),
      lastPruned: new Date(),
      nextCareDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      location: newBonsaiLocation,
      potSize: 'Moyen',
      soilLastChanged: new Date(),
    };

    saveBonsaiProfile(newBonsai);
    
    // Reset form
    setShowAddBonsaiForm(false);
    setNewBonsaiName('');
    setNewBonsaiAge(1);
    setNewBonsaiLocation('indoor');
    
    toast({
      title: 'Bonsaï ajouté !',
      description: `${newBonsai.name} a été ajouté à votre collection.`,
    });

    // Optionally switch to collection page
    setCurrentPage('collection');
  };

  // Page rendering functions
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre collection de bonsaïs et activités récentes
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

      {/* Activités récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.activity className="h-5 w-5" />
            Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Icons.scissors className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Taille effectuée</p>
                <p className="text-xs text-muted-foreground">Érable japonais - Il y a 2 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Icons.droplets className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Arrosage</p>
                <p className="text-xs text-muted-foreground">Ficus Ginseng - Hier</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Icons.search className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Espèce identifiée</p>
                <p className="text-xs text-muted-foreground">Pin noir du Japon - Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conseils du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.leaf className="h-5 w-5" />
            Conseil du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-accent/20 rounded-lg">
            <p className="text-sm">
              <strong>Astuce saisonnière :</strong> En hiver, réduisez l'arrosage de vos bonsaïs d'intérieur. 
              La terre doit sécher légèrement entre deux arrosages pour éviter la pourriture des racines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ma Collection</h1>
          <p className="text-muted-foreground">
            Gérez et suivez l'évolution de vos bonsaïs
          </p>
        </div>
        <Button onClick={() => setCurrentPage('identify')}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Identifier un nouveau bonsaï
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Rechercher par nom ou espèce..." className="flex-1" />
            <Button variant="outline">
              <Icons.filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des bonsaïs */}
      {bonsaiProfiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Icons.tree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun bonsaï dans votre collection</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par identifier votre premier bonsaï pour l'ajouter à votre collection
            </p>
            <Button onClick={() => setCurrentPage('identify')}>
              <Icons.search className="h-4 w-4 mr-2" />
              Identifier mon premier bonsaï
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonsaiProfiles.map((bonsai) => (
            <Card key={bonsai.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bonsai.name}</CardTitle>
                    <CardDescription>{bonsai.species}</CardDescription>
                  </div>
                  <Badge variant={
                    bonsai.healthStatus === 'excellent' ? 'default' :
                    bonsai.healthStatus === 'good' ? 'secondary' :
                    bonsai.healthStatus === 'fair' ? 'outline' : 'destructive'
                  }>
                    {bonsai.healthStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.calendar className="h-4 w-4" />
                    <span>Âge: {bonsai.age} ans</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.droplets className="h-4 w-4" />
                    <span>Dernier arrosage: {new Date(bonsai.lastWatered).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.scissors className="h-4 w-4" />
                    <span>Dernière taille: {new Date(bonsai.lastPruned).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.home className="h-4 w-4" />
                    <span>Emplacement: {bonsai.location}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedBonsai(bonsai)}
                  >
                    <Icons.eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Icons.edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Détail du bonsaï sélectionné */}
      {selectedBonsai && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedBonsai.name}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedBonsai(null)}>
                <Icons.close className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="care">Soins</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Espèce</label>
                    <p className="text-sm text-muted-foreground">{selectedBonsai.species}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Âge</label>
                    <p className="text-sm text-muted-foreground">{selectedBonsai.age} ans</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Emplacement</label>
                    <p className="text-sm text-muted-foreground">{selectedBonsai.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Taille du pot</label>
                    <p className="text-sm text-muted-foreground">{selectedBonsai.potSize}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="care" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Dernier arrosage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {new Date(selectedBonsai.lastWatered).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Dernière fertilisation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {new Date(selectedBonsai.lastFertilized).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Dernière taille</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {new Date(selectedBonsai.lastPruned).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  {selectedBonsai.careHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">{entry.notes}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Espèces populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Espèces populaires</CardTitle>
          <CardDescription>
            Découvrez les espèces les plus appréciées par la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSpecies.map((species) => (
              <SpeciesCard
                key={species.id}
                species={species}
                onClick={() => {
                  toast({
                    title: 'Espèce sélectionnée',
                    description: `Vous pouvez maintenant ajouter un ${species.commonName} à votre collection.`,
                  });
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIdentification = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identification d'espèces</h1>
        <p className="text-muted-foreground">
          Utilisez l'IA pour identifier votre bonsaï et l'ajouter à votre collection
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
              
              {/* Formulaire d'ajout à la collection */}
              {!showAddBonsaiForm ? (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddToCollection} className="flex-1">
                    <Icons.plus className="h-4 w-4 mr-2" />
                    Ajouter à ma collection
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPage('pruning')}>
                    <Icons.scissors className="h-4 w-4 mr-2" />
                    Obtenir des conseils de taille
                  </Button>
                </div>
              ) : (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Ajouter à votre collection</CardTitle>
                    <CardDescription>
                      Complétez les informations pour ajouter ce bonsaï à votre collection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nom du bonsaï *</label>
                      <Input
                        placeholder="ex: Mon érable du jardin"
                        value={newBonsaiName}
                        onChange={(e) => setNewBonsaiName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Âge estimé (années)</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newBonsaiAge}
                        onChange={(e) => setNewBonsaiAge(parseInt(e.target.value) || 1)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        L'IA ne peut pas déterminer l'âge précis. Estimez selon la taille du tronc et l'apparence générale.
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Emplacement</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={newBonsaiLocation}
                        onChange={(e) => setNewBonsaiLocation(e.target.value as 'indoor' | 'outdoor' | 'greenhouse')}
                      >
                        <option value="indoor">Intérieur</option>
                        <option value="outdoor">Extérieur</option>
                        <option value="greenhouse">Serre</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveToCollection} className="flex-1">
                        <Icons.save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddBonsaiForm(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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

  const renderTutorials = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tutoriels</h1>
        <p className="text-muted-foreground">
          Apprenez les techniques essentielles pour entretenir vos bonsaïs
        </p>
      </div>

      {!selectedTutorial ? (
        <>
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <select className="p-2 border rounded-md">
                  <option value="">Toutes les catégories</option>
                  <option value="care">Soins</option>
                  <option value="pruning">Taille</option>
                  <option value="styling">Style</option>
                  <option value="repotting">Rempotage</option>
                </select>
                <select className="p-2 border rounded-md">
                  <option value="">Tous les niveaux</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des tutoriels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </div>
                    <Badge variant={
                      tutorial.difficulty === 'beginner' ? 'secondary' :
                      tutorial.difficulty === 'intermediate' ? 'default' : 'destructive'
                    }>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.clock className="h-4 w-4" />
                      <span>{tutorial.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.list className="h-4 w-4" />
                      <span>{tutorial.steps.length} étapes</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tutorial.tools.slice(0, 3).map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                      {tutorial.tools.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tutorial.tools.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => {
                      setSelectedTutorial(tutorial);
                      setCurrentStep(0);
                    }}
                  >
                    Commencer le tutoriel
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Tutoriel sélectionné */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTutorial.title}</CardTitle>
                <CardDescription>
                  Étape {currentStep + 1} sur {selectedTutorial.steps.length}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedTutorial(null)}>
                <Icons.close className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Barre de progression */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / selectedTutorial.steps.length) * 100}%` }}
                />
              </div>

              {/* Étape actuelle */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {selectedTutorial.steps[currentStep].title}
                </h3>
                <p className="text-muted-foreground">
                  {selectedTutorial.steps[currentStep].description}
                </p>
                
                {selectedTutorial.steps[currentStep].tips.length > 0 && (
                  <div className="bg-accent/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">💡 Conseils :</h4>
                    <ul className="space-y-1">
                      {selectedTutorial.steps[currentStep].tips.map((tip, index) => (
                        <li key={index} className="text-sm">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  <Icons.chevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                
                {currentStep < selectedTutorial.steps.length - 1 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Suivant
                    <Icons.chevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => {
                    toast({
                      title: 'Tutoriel terminé !',
                      description: 'Félicitations, vous avez terminé ce tutoriel.',
                    });
                    setSelectedTutorial(null);
                  }}>
                    Terminer
                    <Icons.success className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communauté</h1>
          <p className="text-muted-foreground">
            Partagez vos expériences et apprenez des autres passionnés
          </p>
        </div>
        <Button>
          <Icons.plus className="h-4 w-4 mr-2" />
          Nouveau post
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select className="p-2 border rounded-md">
              <option value="">Toutes les catégories</option>
              <option value="showcase">Vitrine</option>
              <option value="help">Aide</option>
              <option value="tutorial">Tutoriel</option>
              <option value="discussion">Discussion</option>
            </select>
            <Input placeholder="Rechercher..." className="flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Posts de la communauté */}
      <div className="space-y-6">
        {mockCommunityPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icons.user className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.userName}</h3>
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">{post.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
              
              {post.images.length > 0 && (
                <div className="mb-4">
                  <img 
                    src={post.images[0]} 
                    alt="Post image"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Icons.heart className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <Icons.message className="h-4 w-4 mr-1" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Icons.share className="h-4 w-4 mr-1" />
                  Partager
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Météo</h1>
        <p className="text-muted-foreground">
          Conditions météorologiques et conseils adaptés
        </p>
      </div>

      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherWidget weather={weather} location="Paris" />
          
          <Card>
            <CardHeader>
              <CardTitle>Conseils selon la météo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Arrosage</h4>
                  <p className="text-sm text-blue-700">
                    Avec {weather.humidity}% d'humidité, réduisez légèrement l'arrosage.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Exposition</h4>
                  <p className="text-sm text-green-700">
                    Température idéale pour placer vos bonsaïs à l'extérieur.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900">Protection</h4>
                  <p className="text-sm text-orange-700">
                    Vent de {weather.windSpeed} km/h : protégez les jeunes pousses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configurez votre application selon vos préférences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Langue</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Unité de température</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Thème</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rappels d'arrosage</p>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications pour l'arrosage</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Conseils de taille</p>
                  <p className="text-sm text-muted-foreground">Notifications pour les périodes de taille</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertes météo</p>
                  <p className="text-sm text-muted-foreground">Alertes pour conditions météo défavorables</p>
                </div>
                <input type="checkbox" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom d'utilisateur</label>
                <Input placeholder="Votre nom" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="votre@email.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Localisation</label>
                <Input placeholder="Ville, Pays" className="mt-1" />
              </div>
              <Button>Sauvegarder les modifications</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'collection':
        return renderCollection();
      case 'identify':
        return renderIdentification();
      case 'pruning':
        return renderPruning();
      case 'care':
        return renderCare();
      case 'visualization':
        return renderVisualization();
      case 'weather':
        return renderWeather();
      case 'tutorials':
        return renderTutorials();
      case 'community':
        return renderCommunity();
      case 'settings':
        return renderSettings();
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