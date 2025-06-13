'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/navigation';
import { DashboardStats } from '@/components/bonsai/dashboard-stats';
import { CareCalendar } from '@/components/bonsai/care-calendar';
import { WeatherWidget } from '@/components/bonsai/weather-widget';
import { PruningGuide } from '@/components/bonsai/pruning-guide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useBonsaiData } from '@/hooks/use-bonsai-data';
import { useWeather } from '@/hooks/use-weather';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { identifySpecies, type IdentifySpeciesOutput } from '@/ai/flows/identify-species';
import { suggestPruning, type SuggestPruningOutput } from '@/ai/flows/suggest-pruning';
import { suggestCare, type SuggestCareOutput } from '@/ai/flows/suggest-care';
import Image from 'next/image';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<IdentifySpeciesOutput | null>(null);
  const [pruningSuggestions, setPruningSuggestions] = useState<SuggestPruningOutput | null>(null);
  const [careSuggestions, setCareSuggestions] = useState<SuggestCareOutput | null>(null);
  const [description, setDescription] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [currentSeason, setCurrentSeason] = useState('Spring');
  const [treeHealth, setTreeHealth] = useState('');

  const { bonsaiProfiles, careReminders, updateCareReminder } = useBonsaiData();
  const { weather } = useWeather('Paris');
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Créer un élément video temporaire
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.play();
      
      // Attendre que la vidéo soit prête
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve, { once: true });
      });
      
      // Attendre un court délai pour que l'image se stabilise
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Créer le canvas et capturer l'image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
      }
      
      // Arrêter le stream
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d&apos;accéder à l&apos;appareil photo",
        variant: "destructive"
      });
    }
  };

  const handleIdentifySpecies = async () => {
    if (!selectedImage || !description) {
      toast({
        title: "Information manquante",
        description: "Veuillez fournir une image et une description",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await identifySpecies({
        photoUrl: selectedImage,
        description: description
      });
      setIdentificationResult(result);
      toast({
        title: "Identification réussie",
        description: `Espèce identifiée: ${result.species}`,
      });
    } catch (error) {
      console.error('Identification error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l&apos;identification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPruningSuggestions = async () => {
    if (!identificationResult || !userGoals) {
      toast({
        title: "Information manquante",
        description: "Veuillez d&apos;abord identifier l&apos;espèce et définir vos objectifs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await suggestPruning({
        species: identificationResult.species,
        userGoals: userGoals,
        bonsaiDescription: description
      });
      setPruningSuggestions(result);
      toast({
        title: "Suggestions générées",
        description: "Conseils de taille disponibles",
      });
    } catch (error) {
      console.error('Pruning suggestions error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCareSuggestions = async () => {
    if (!identificationResult || !treeHealth) {
      toast({
        title: "Information manquante",
        description: "Veuillez d&apos;abord identifier l&apos;espèce et décrire l&apos;état de santé",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await suggestCare({
        species: identificationResult.species,
        currentSeason: currentSeason,
        treeHealth: treeHealth
      });
      setCareSuggestions(result);
      toast({
        title: "Conseils générés",
        description: "Conseils de soins disponibles",
      });
    } catch (error) {
      console.error('Care suggestions error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des conseils",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de votre collection de bonsaïs
          </p>
        </div>
        <Button onClick={() => setCurrentPage('identify')}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Ajouter un bonsaï
        </Button>
      </div>

      <DashboardStats 
        bonsaiProfiles={bonsaiProfiles} 
        careReminders={careReminders} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareCalendar 
          reminders={careReminders}
          onReminderClick={(reminder) => updateCareReminder(reminder.id, { isCompleted: true })}
        />
        {weather && (
          <WeatherWidget 
            weather={weather} 
            location="Paris, France" 
          />
        )}
      </div>
    </div>
  );

  const renderIdentify = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identifier votre bonsaï</h1>
        <p className="text-muted-foreground">
          Utilisez l&apos;IA pour identifier l&apos;espèce de votre bonsaï
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Photo de votre bonsaï</CardTitle>
            <CardDescription>
              Prenez une photo ou sélectionnez une image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <Image 
                    src={selectedImage} 
                    alt="Bonsaï sélectionné" 
                    width={300}
                    height={200}
                    className="max-w-full h-48 object-cover mx-auto rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedImage(null)}
                  >
                    Changer l&apos;image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Icons.camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Prenez une photo ou sélectionnez une image
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCameraCapture}
                className="flex-1"
                variant="outline"
              >
                <Icons.camera className="h-4 w-4 mr-2" />
                Utiliser l&apos;appareil photo
              </Button>
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex-1"
                variant="outline"
              >
                <Icons.image className="h-4 w-4 mr-2" />
                Choisir un fichier
              </Button>
            </div>
            
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Décrivez votre bonsaï pour améliorer l&apos;identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Décrivez les caractéristiques de votre bonsaï (forme des feuilles, couleur de l&apos;écorce, taille, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            
            <Button 
              onClick={handleIdentifySpecies}
              disabled={!selectedImage || !description || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Identification en cours...
                </>
              ) : (
                <>
                  <Icons.search className="h-4 w-4 mr-2" />
                  Identifier l&apos;espèce
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {identificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat de l&apos;identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{identificationResult.species}</h3>
                  <p className="text-muted-foreground">{identificationResult.characteristics}</p>
                </div>
                <Badge variant="outline">
                  {Math.round(identificationResult.confidence * 100)}% de confiance
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button onClick={() => setCurrentPage('pruning')}>
                  <Icons.scissors className="h-4 w-4 mr-2" />
                  Conseils de taille
                </Button>
                <Button variant="outline" onClick={() => setCurrentPage('care')}>
                  <Icons.droplets className="h-4 w-4 mr-2" />
                  Conseils de soins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCollection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ma Collection</h1>
          <p className="text-muted-foreground">
            Gérez vos bonsaïs et suivez leur évolution
          </p>
        </div>
        <Button onClick={() => setCurrentPage('identify')}>
          <Icons.plus className="h-4 w-4 mr-2" />
          Ajouter un bonsaï
        </Button>
      </div>

      {bonsaiProfiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.tree className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun bonsaï dans votre collection</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par identifier votre premier bonsaï pour créer votre collection
            </p>
            <Button onClick={() => setCurrentPage('identify')}>
              <Icons.camera className="h-4 w-4 mr-2" />
              Identifier mon premier bonsaï
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonsaiProfiles.map((profile) => (
            <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {profile.name}
                  <Badge variant="outline">{profile.species}</Badge>
                </CardTitle>
                <CardDescription>
                  Âge: {profile.age} ans • {profile.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>État de santé:</span>
                    <Badge 
                      variant={profile.healthStatus === 'excellent' ? 'default' : 'outline'}
                    >
                      {profile.healthStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dernier arrosage: {new Date(profile.lastWatered).toLocaleDateString()}
                  </div>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Soins et Calendrier</h1>
        <p className="text-muted-foreground">
          Planifiez et suivez les soins de vos bonsaïs
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions IA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <CareCalendar 
            reminders={careReminders}
            onReminderClick={(reminder) => updateCareReminder(reminder.id, { isCompleted: true })}
          />
        </TabsContent>
        
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Conseils de soins personnalisés</CardTitle>
              <CardDescription>
                Obtenez des conseils adaptés à votre bonsaï et à la saison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saison actuelle</label>
                  <select 
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Spring">Printemps</option>
                    <option value="Summer">Été</option>
                    <option value="Autumn">Automne</option>
                    <option value="Winter">Hiver</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">État de santé</label>
                  <Textarea
                    placeholder="Décrivez l&apos;état actuel de votre bonsaï..."
                    value={treeHealth}
                    onChange={(e) => setTreeHealth(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleGetCareSuggestions}
                disabled={!identificationResult || !treeHealth || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Icons.leaf className="h-4 w-4 mr-2" />
                    Obtenir des conseils
                  </>
                )}
              </Button>
              
              {careSuggestions && (
                <Alert>
                  <Icons.leaf className="h-4 w-4" />
                  <AlertTitle>Conseils de soins</AlertTitle>
                  <AlertDescription>
                    {careSuggestions.careSuggestions}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderPruning = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guide de Taille</h1>
        <p className="text-muted-foreground">
          Conseils de taille personnalisés avec l&apos;IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vos objectifs</CardTitle>
            <CardDescription>
              Décrivez ce que vous souhaitez accomplir avec la taille
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ex: Améliorer la forme, réduire la taille, favoriser la ramification..."
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
              rows={4}
            />
            
            <Button 
              onClick={handleGetPruningSuggestions}
              disabled={!identificationResult || !userGoals || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Icons.scissors className="h-4 w-4 mr-2" />
                  Obtenir des conseils de taille
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {pruningSuggestions && (
          <PruningGuide 
            suggestions={pruningSuggestions}
            onApplyPruning={(branchId) => {
              toast({
                title: "Taille appliquée",
                description: `Branche ${branchId} marquée comme taillée`,
              });
            }}
            onSaveSession={() => {
              toast({
                title: "Session sauvegardée",
                description: "Votre session de taille a été enregistrée",
              });
            }}
          />
        )}
      </div>

      {!identificationResult && (
        <Alert>
          <Icons.info className="h-4 w-4" />
          <AlertTitle>Identification requise</AlertTitle>
          <AlertDescription>
            Veuillez d&apos;abord identifier votre bonsaï pour obtenir des conseils de taille personnalisés.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={() => setCurrentPage('identify')}
            >
              Identifier maintenant
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderVisualization = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visualisation 3D</h1>
        <p className="text-muted-foreground">
          Modèle 3D interactif de votre bonsaï
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icons.eye className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Visualisation 3D</h3>
          <p className="text-muted-foreground text-center mb-4">
            La fonctionnalité de visualisation 3D sera bientôt disponible
          </p>
          <Badge variant="outline">Prochainement</Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderWeather = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Météo</h1>
        <p className="text-muted-foreground">
          Conditions météorologiques et impact sur vos bonsaïs
        </p>
      </div>

      {weather ? (
        <WeatherWidget weather={weather} location="Paris, France" />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.cloud className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chargement des données météo</h3>
            <p className="text-muted-foreground">
              Veuillez patienter...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTutorials = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tutoriels</h1>
        <p className="text-muted-foreground">
          Guides d&apos;apprentissage pour maîtriser l&apos;art du bonsaï
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Premiers pas avec les bonsaïs",
            description: "Guide complet pour débuter",
            difficulty: "Débutant",
            duration: "30 min"
          },
          {
            title: "Techniques de taille",
            description: "Maîtrisez l&apos;art de la taille",
            difficulty: "Intermédiaire",
            duration: "45 min"
          },
          {
            title: "Arrosage et fertilisation",
            description: "Optimisez les soins quotidiens",
            difficulty: "Débutant",
            duration: "20 min"
          }
        ].map((tutorial, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <CardDescription>{tutorial.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{tutorial.difficulty}</Badge>
                <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communauté</h1>
        <p className="text-muted-foreground">
          Partagez et discutez avec d&apos;autres passionnés de bonsaï
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icons.users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Communauté</h3>
          <p className="text-muted-foreground text-center mb-4">
            La section communauté sera bientôt disponible
          </p>
          <Badge variant="outline">Prochainement</Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input placeholder="Votre nom" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="votre@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localisation</label>
              <Input placeholder="Ville, Pays" />
            </div>
            <Button>Sauvegarder</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Bonsaïs dans la collection</span>
              <Badge>{bonsaiProfiles.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Identifications effectuées</span>
              <Badge>0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Sessions de taille</span>
              <Badge>0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configurez l&apos;application selon vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Rappels d&apos;arrosage</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Conseils de taille</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Alertes météo</span>
              <input type="checkbox" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Langue</label>
              <select className="w-full p-2 border rounded-md">
                <option>Français</option>
                <option>English</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unités de température</label>
              <select className="w-full p-2 border rounded-md">
                <option>Celsius</option>
                <option>Fahrenheit</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aide</h1>
        <p className="text-muted-foreground">
          Support et documentation pour utiliser BonsAI Assist
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guide">Guide d&apos;utilisation</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <div className="space-y-4">
            {[
              {
                question: "Comment identifier mon bonsaï ?",
                answer: "Utilisez la section &apos;Identifier&apos; pour prendre une photo de votre bonsaï et ajouter une description. Notre IA analysera l&apos;image pour identifier l&apos;espèce."
              },
              {
                question: "À quelle fréquence dois-je arroser mon bonsaï ?",
                answer: "La fréquence d&apos;arrosage dépend de l&apos;espèce, de la saison et des conditions environnementales. Utilisez nos conseils personnalisés dans la section &apos;Soins&apos;."
              },
              {
                question: "Comment utiliser les conseils de taille ?",
                answer: "Après avoir identifié votre bonsaï, définissez vos objectifs dans la section &apos;Taille&apos; pour recevoir des conseils personnalisés de notre IA."
              },
              {
                question: "Puis-je suivre plusieurs bonsaïs ?",
                answer: "Oui, vous pouvez ajouter autant de bonsaïs que vous le souhaitez dans votre collection et suivre leurs soins individuellement."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Guide d&apos;utilisation</CardTitle>
              <CardDescription>
                Découvrez toutes les fonctionnalités de BonsAI Assist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Identification</h3>
                <p className="text-sm text-muted-foreground">
                  Prenez une photo claire de votre bonsaï et ajoutez une description détaillée pour une identification précise.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">2. Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez tous vos bonsaïs dans un seul endroit, suivez leur évolution et planifiez leurs soins.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">3. Soins</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des rappels personnalisés et des conseils adaptés à chaque espèce et à la saison.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">4. Taille</h3>
                <p className="text-sm text-muted-foreground">
                  Obtenez des conseils de taille précis basés sur vos objectifs et l&apos;espèce de votre bonsaï.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contactez-nous</CardTitle>
              <CardDescription>
                Besoin d&apos;aide ? Notre équipe est là pour vous aider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sujet</label>
                <Input placeholder="Objet de votre message" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Décrivez votre problème ou votre question..."
                  rows={4}
                />
              </div>
              
              <Button>
                <Icons.message className="h-4 w-4 mr-2" />
                Envoyer le message
              </Button>
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
      case 'identify':
        return renderIdentify();
      case 'collection':
        return renderCollection();
      case 'care':
        return renderCare();
      case 'pruning':
        return renderPruning();
      case 'visualization':
        return renderVisualization();
      case 'weather':
        return renderWeather();
      case 'tutorials':
        return renderTutorials();
      case 'community':
        return renderCommunity();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      case 'help':
        return renderHelp();
      default:
        return renderDashboard();
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
      <Toaster />
    </SidebarProvider>
  );
}