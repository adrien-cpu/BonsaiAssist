'use client';

import { useState, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useBonsaiData } from '@/hooks/use-bonsai-data';
import { useWeather } from '@/hooks/use-weather';
import { identifySpecies } from '@/ai/flows/identify-species';
import { suggestPruning } from '@/ai/flows/suggest-pruning';
import { suggestCare } from '@/ai/flows/suggest-care';
import { BonsaiProfile, BonsaiSpecies, CareReminder, WeatherData, UserPreferences } from '@/types';

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

// Mock user profile data
const mockUserProfile = {
  name: 'Jean Dupont',
  email: 'jean.dupont@email.com',
  avatar: '',
  joinDate: new Date('2024-01-15'),
  level: 'Intermédiaire',
  totalBonsai: 0,
  experienceYears: 3,
  favoriteSpecies: 'Érable japonais',
  location: 'Paris, France'
};

const mockUserPreferences: UserPreferences = {
  notifications: {
    watering: true,
    fertilizing: true,
    pruning: true,
    weather: false
  },
  units: {
    temperature: 'celsius',
    measurement: 'metric'
  },
  language: 'fr',
  theme: 'auto',
  location: {
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris'
  }
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
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  const [userPreferences, setUserPreferences] = useState(mockUserPreferences);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bonsaiProfiles, careReminders, saveBonsaiProfile, addCareReminder } = useBonsaiData();

  // Fonction pour démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Utilise la caméra arrière sur mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      // Fallback vers l'upload de fichier
      fileInputRef.current?.click();
    }
  };

  // Fonction pour arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsUsingCamera(false);
    }
  };

  // Fonction pour prendre une photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUrl);
        stopCamera();
      }
    }
  };

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
      age: 0,
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
              Prenez une photo ou sélectionnez une image de votre bonsaï
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {isUsingCamera ? (
                <div className="space-y-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={capturePhoto}>
                      <Icons.camera className="h-4 w-4 mr-2" />
                      Prendre la photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : photoPreview ? (
                <div className="space-y-4">
                  <img 
                    src={photoPreview} 
                    alt="Aperçu" 
                    className="max-w-full h-48 object-cover mx-auto rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPhotoPreview('');
                      setPhotoFile(null);
                    }}
                  >
                    Changer la photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Icons.camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Prenez une photo ou sélectionnez une image</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={startCamera}>
                      <Icons.camera className="h-4 w-4 mr-2" />
                      Utiliser l'appareil photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icons.upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                  </div>
                </div>
              )}
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />
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

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.user className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-lg">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <Badge variant="outline" className="mt-1">
                  Niveau {userProfile.level}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input 
                  id="location" 
                  value={userProfile.location}
                  onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="experience">Années d'expérience</Label>
                <Input 
                  id="experience" 
                  type="number"
                  value={userProfile.experienceYears}
                  onChange={(e) => setUserProfile({...userProfile, experienceYears: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="favorite">Espèce favorite</Label>
              <Input 
                id="favorite" 
                value={userProfile.favoriteSpecies}
                onChange={(e) => setUserProfile({...userProfile, favoriteSpecies: e.target.value})}
              />
            </div>

            <Button className="w-full">
              <Icons.save className="h-4 w-4 mr-2" />
              Sauvegarder les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.barChart className="h-5 w-5" />
              Mes statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{bonsaiProfiles.length}</div>
                <div className="text-sm text-muted-foreground">Bonsaïs</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{userProfile.experienceYears}</div>
                <div className="text-sm text-muted-foreground">Années d'expérience</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor((new Date().getTime() - userProfile.joinDate.getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-muted-foreground">Jours sur l'app</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {careReminders.filter(r => r.isCompleted).length}
                </div>
                <div className="text-sm text-muted-foreground">Soins effectués</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Progression</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Niveau actuel</span>
                  <span>{userProfile.level}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Continuez à prendre soin de vos bonsaïs pour progresser !
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Badges obtenus</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Icons.tree className="h-3 w-3 mr-1" />
                  Premier bonsaï
                </Badge>
                <Badge variant="outline">
                  <Icons.droplets className="h-3 w-3 mr-1" />
                  Arrosage régulier
                </Badge>
                <Badge variant="outline">
                  <Icons.calendar className="h-3 w-3 mr-1" />
                  Utilisateur actif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.settings className="h-5 w-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="units">Unités</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="watering-notif">Rappels d'arrosage</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications pour l'arrosage</p>
                  </div>
                  <Switch 
                    id="watering-notif"
                    checked={userPreferences.notifications.watering}
                    onCheckedChange={(checked) => 
                      setUserPreferences({
                        ...userPreferences,
                        notifications: {...userPreferences.notifications, watering: checked}
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="fertilizing-notif">Rappels de fertilisation</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications pour la fertilisation</p>
                  </div>
                  <Switch 
                    id="fertilizing-notif"
                    checked={userPreferences.notifications.fertilizing}
                    onCheckedChange={(checked) => 
                      setUserPreferences({
                        ...userPreferences,
                        notifications: {...userPreferences.notifications, fertilizing: checked}
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pruning-notif">Rappels de taille</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications pour la taille</p>
                  </div>
                  <Switch 
                    id="pruning-notif"
                    checked={userPreferences.notifications.pruning}
                    onCheckedChange={(checked) => 
                      setUserPreferences({
                        ...userPreferences,
                        notifications: {...userPreferences.notifications, pruning: checked}
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weather-notif">Alertes météo</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des alertes météorologiques</p>
                  </div>
                  <Switch 
                    id="weather-notif"
                    checked={userPreferences.notifications.weather}
                    onCheckedChange={(checked) => 
                      setUserPreferences({
                        ...userPreferences,
                        notifications: {...userPreferences.notifications, weather: checked}
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="units" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature-unit">Unité de température</Label>
                  <Select 
                    value={userPreferences.units.temperature}
                    onValueChange={(value: 'celsius' | 'fahrenheit') => 
                      setUserPreferences({
                        ...userPreferences,
                        units: {...userPreferences.units, temperature: value}
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="measurement-unit">Système de mesure</Label>
                  <Select 
                    value={userPreferences.units.measurement}
                    onValueChange={(value: 'metric' | 'imperial') => 
                      setUserPreferences({
                        ...userPreferences,
                        units: {...userPreferences.units, measurement: value}
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Métrique</SelectItem>
                      <SelectItem value="imperial">Impérial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4">
              <div>
                <Label htmlFor="theme">Thème</Label>
                <Select 
                  value={userPreferences.theme}
                  onValueChange={(value: 'light' | 'dark' | 'auto') => 
                    setUserPreferences({...userPreferences, theme: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Langue</Label>
                <Select 
                  value={userPreferences.language}
                  onValueChange={(value) => 
                    setUserPreferences({...userPreferences, language: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
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
            Les paramètres avancés seront bientôt disponibles
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Aide</h1>
      <Card>
        <CardContent className="text-center py-12">
          <Icons.info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Centre d'aide</h3>
          <p className="text-muted-foreground">
            La documentation et l'aide seront bientôt disponibles
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
      case 'profile': return renderProfile();
      case 'settings': return renderSettings();
      case 'help': return renderHelp();
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