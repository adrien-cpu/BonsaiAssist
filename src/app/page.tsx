"use client";

import type {IdentifySpeciesOutput} from '@/ai/flows/identify-species';
import {identifySpecies} from '@/ai/flows/identify-species';
import type {SuggestCareOutput} from '@/ai/flows/suggest-care';
import {suggestCare} from '@/ai/flows/suggest-care';
import type {SuggestPruningOutput} from '@/ai/flows/suggest-pruning';
import {suggestPruning} from '@/ai/flows/suggest-pruning';
import {Icons} from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {Switch} from '@/components/ui/switch';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {toast} from '@/hooks/use-toast';
import {
  Camera, CircleDotDashed,
  Home,
  PlusCircle,
  Settings,
  Share2,
  Shield,
  Trash,
  User,
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState} from 'react';
import * as UnityWebGL from 'react-unity-webgl';
const unityConfig: UnityConfig = {
  loaderUrl: '/unity/bonsai_build.loader.js',
  dataUrl: '/unity/bonsai_build.data',
  frameworkUrl: '/unity/bonsai_build.framework.js',
  codeUrl: '/unity/bonsai_build.wasm',
};

export default function IndexPage() {
  const [speciesDescription, setSpeciesDescription] = useState('');
  const [identificationResult, setIdentificationResult] =
    React.useState<IdentifySpeciesOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pruningGoals, setPruningGoals] = React.useState('');
  const [pruningSuggestions, setPruningSuggestions] =
    React.useState<SuggestPruningOutput | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [treeStructure, setTreeStructure] = useState('');
  const [careSuggestions, setCareSuggestions] =
    React.useState<SuggestCareOutput | null>(null);
  const [currentSeason, setCurrentSeason] = useState('');
  const [treeHealth, setTreeHealth] = useState('');
  const [rememberCameraChoice, setRememberCameraChoice] = useState(false); // Nouvel état pour la case à cocher
  const [isCameraConfirmationOpen, setIsCameraConfirmationOpen] = useState(false);

  // Unity Integration
  const {
    unityProvider,
    isLoaded,
    loadingErrorCode, sendMessage,
    addEventListener,
    removeEventListener,
  } = UnityWebGL.useUnityContext(unityConfig);

  // Callback pour gérer les messages venant d'Unity
  const handleUnityEvent = React.useCallback((...parameters: UnityWebGL.ReactUnityEventParameter[]) => {
    // The first parameter is usually the event name, followed by data
    const eventName = parameters[0] as string;
    const data = parameters.slice(1);
    console.log('Événement Unity reçu:', eventName, ...data);
    // Traiter les événements spécifiques venant d'Unity si nécessaire
  }, []);

  React.useEffect(() => {
    addEventListener('BonsaiLoaded', handleUnityEvent);
    addEventListener('PruningApplied', handleUnityEvent); // Assuming PruningApplied also sends data
    return () => {
      removeEventListener('BonsaiLoaded', handleUnityEvent);
      removeEventListener('PruningApplied', handleUnityEvent);
    };
  }, [addEventListener, removeEventListener, handleUnityEvent]);

  // Fonction pour envoyer les données du bonsaï à Unity
  const sendBonsaiDataToUnity = (data: any) => {
    if (isLoaded) {
      sendMessage('BonsaiManager', 'LoadBonsaiData', JSON.stringify(data));
    } else {
      console.warn("Unity n'est pas encore chargé.");
    }
  };

  // Fonction pour envoyer les suggestions de taille à Unity
  const sendPruningSuggestionsToUnity = (suggestions: SuggestPruningOutput) => {
    if (isLoaded) {
      sendMessage(
        'BonsaiManager',
        'HighlightPruningAreas',
        JSON.stringify(suggestions.branchIdentifications)
      );
      // Si vous voulez envoyer les suggestions textuelles aussi:
      // sendMessage("BonsaiManager", "DisplayPruningSuggestions", suggestions.pruningSuggestions);
    } else {
      console.warn("Unity n'est pas encore chargé.");
    }
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      setHasCameraPermission(true);
      setIsCameraEnabled(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Mémoriser le choix si la case est cochée
      if (rememberCameraChoice) {
        localStorage.setItem('cameraPermissionGranted', 'true');
      }
    } catch (err: unknown) {
      console.error("Erreur lors de l'accès à la caméra :", err);
      setHasCameraPermission(false);
      setIsCameraEnabled(false);
      if (
        err instanceof Error &&
        (err.name === 'PermissionDeniedError' ||
          err.name === 'NotAllowedError')
      ) {
        toast({
          variant: 'destructive',
          title: 'Accès à la caméra refusé',
          description:
            'Veuillez activer les autorisations de la caméra dans les paramètres de votre navigateur pour utiliser cette application.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur de caméra',
          description:
            "Une erreur s'est produite lors de l'accès à la caméra.",
        });
      }
    } finally {
      setIsCameraConfirmationOpen(false); // Ferme la pop-up après la tentative
    }
  };

  const disableCamera = () => {
    setIsCameraEnabled(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    // Oublier le choix si la case est cochée et qu'on désactive
    if (rememberCameraChoice) {
      localStorage.removeItem('cameraPermissionGranted');
    }
  };

  React.useEffect(() => {
    // Vérifier si l'autorisation a été mémorisée
    const permissionGranted = localStorage.getItem('cameraPermissionGranted');
    if (permissionGranted === 'true') {
      setRememberCameraChoice(true); // Coche la case si mémorisé
      enableCamera(); // Active directement la caméra
    }

    const currentVideo = videoRef.current;

    return () => {
      if (currentVideo && currentVideo.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Exécuter une seule fois au montage

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhotoUrl(dataUrl); // Stocke l'URL data de l'image capturée
        handleIdentifySpecies(dataUrl); // Identifie directement avec l'image capturée
      }
    }
  };

  const handleIdentifySpecies = async (imageDataUrl?: string) => {
    setIsLoading(true);
    setError(null);
    const urlToUse = imageDataUrl || photoUrl; // Utilise l'image capturée si fournie, sinon celle de l'input URL

    try {
      if (!urlToUse) {
        setError(
          imageDataUrl
            ? "Impossible de capturer l'image."
            : "Veuillez fournir l'URL d'une photo ou prendre une photo."
        );
        setIsLoading(false);
        return;
      }
      // Vérifie si l'URL commence par 'data:' (indiquant une data URI)
      if (!urlToUse.startsWith('data:')) {
         setError("Le format de l'URL de l'image n'est pas valide. Utilisez une image capturée ou une URL data.");
         setIsLoading(false);
         return;
      }

      const result = await identifySpecies({
        // The AI model expects photoUrl, not photoDataUri
        photoUrl: urlToUse,
        description: speciesDescription,
      });
      setIdentificationResult(result); // Met à jour l'état avec le résultat
      // Envoyer les données à Unity après identification
      sendBonsaiDataToUnity(result);
    } catch (err: any) {
      console.error("Erreur lors de l'identification de l'espèce:", err);
      setError(
        `Échec de l'identification de l'espèce: ${err.message || 'Veuillez vérifier les entrées et réessayer.'}`
      ); // Met à jour l'état d'erreur
    }
    setIsLoading(false); // Désactive l'indicateur de chargement
  };

  const handleSuggestPruning = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!identificationResult?.species) {
        setError(
          "Veuillez identifier l'espèce avant de demander des suggestions de taille."
        );
        setIsLoading(false);
        return;
      }
      const result = await suggestPruning({
        species: identificationResult.species,
        userGoals: pruningGoals,
        bonsaiDescription: speciesDescription,
        treeStructure: treeStructure,
      });
      setPruningSuggestions(result);
      // Envoyer les suggestions à Unity
      sendPruningSuggestionsToUnity(result);
    } catch (err) {
      console.error('Erreur lors de la suggestion de taille :', err);
      setError(
        'Échec de la suggestion de taille. Veuillez vérifier les entrées et réessayer.'
      );
    }
    setIsLoading(false);
  };

  const handleSuggestCare = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!identificationResult?.species) {
        setError(
          "Veuillez identifier l'espèce avant de demander des suggestions de soins."
        );
        setIsLoading(false);
        return;
      }
      const result = await suggestCare({
        species: identificationResult.species,
        currentSeason: currentSeason,
        treeHealth: treeHealth,
      });
      setCareSuggestions(result);
    } catch (err: unknown) {
      console.error('Erreur lors de la suggestion de soins :', err);
      setError(
        'Échec de la suggestion de soins. Veuillez vérifier les entrées et réessayer.'
      );
    }
    setIsLoading(false);
  };

  return (
    <main className="flex h-screen antialiased text-foreground bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuButton className="flex items-center mt-2">
                <Home className="mr-2 h-4 w-4" />
                Toggle Sidebar
              </SidebarMenuButton>
            </SidebarMenu>
            <div className="p-2">
              <div className="font-medium text-sm">BonsAI Assist</div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center">
                  <Icons.search className="mr-2 h-4 w-4" />
                  Identifier l'espèce
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Guide de taille
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  Visualisation et Taille
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="p-2">
              <div className="font-medium text-sm">Compte</div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Confidentialité
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center">
                    <Trash className="mr-2 h-4 w-4" />
                    Corbeille
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <div className="p-2 mt-auto">
                <p className="text-xs text-muted-foreground">
                  Créez de magnifiques Bonsaïs quelle que soit votre expérience
                </p>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col border-l overflow-y-auto">
          <div className="container mx-auto p-4 flex-grow">
            <Card>
              <CardHeader>
                <CardTitle>Identifier votre Bonsaï</CardTitle>
                <CardDescription>
                  Utilisez votre caméra ou fournissez une URL pour identifier
                  votre bonsaï.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="camera" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">Caméra</TabsTrigger>
                    <TabsTrigger value="url">URL/Description</TabsTrigger>
                  </TabsList>
                  <TabsContent value="camera">
                    <div className="flex items-center justify-between mb-2">
                       <CardDescription>
                          Visualisez votre bonsaï avec votre caméra
                       </CardDescription>
                       <AlertDialog
                         open={isCameraConfirmationOpen}
                         onOpenChange={setIsCameraConfirmationOpen}
                       >
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="outline"
                             disabled={isLoading || isCameraEnabled} // Désactive si déjà activé
                             onClick={() => setIsCameraConfirmationOpen(true)} // Ouvre la pop-up
                           >
                             <Camera className="mr-2 h-4 w-4" />
                             Activer la caméra
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>
                               Activer la caméra ?
                             </AlertDialogTitle>
                             <AlertDialogDescription>
                               L'activation de la caméra permettra à
                               l'application d'accéder à la caméra de votre
                               appareil. Assurez-vous d'avoir accordé les
                               autorisations nécessaires.
                               <div className="flex items-center space-x-2 mt-4">
                                 <Switch
                                   id="remember-camera"
                                   checked={rememberCameraChoice}
                                   onCheckedChange={setRememberCameraChoice}
                                 />
                                 <Label htmlFor="remember-camera">
                                   Se souvenir de mon choix
                                 </Label>
                               </div>
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel onClick={() => setIsCameraConfirmationOpen(false)}> {/* Ferme la pop-up */}
                               Annuler
                             </AlertDialogCancel>
                             <AlertDialogAction onClick={enableCamera}>
                               Continuer
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>

                     {hasCameraPermission === false && ( // Affiche seulement si la permission n'est PAS accordée
                       <Alert variant="destructive" className="mb-4">
                         <AlertTitle>Accès à la caméra requis</AlertTitle>
                         <AlertDescription>
                           Veuillez autoriser l'accès à la caméra pour utiliser
                           cette fonctionnalité.
                         </AlertDescription>
                       </Alert>
                     )}


                    <video
                      ref={videoRef}
                      className={`w-full aspect-video rounded-md ${
                        isCameraEnabled ? '' : 'bg-muted'
                      }`} // Fond gris si caméra désactivée
                      autoPlay
                      muted
                    />
                    <canvas ref={canvasRef} style={{display: 'none'}} />

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={captureImage}
                        disabled={isLoading || !isCameraEnabled}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.camera className="mr-2 h-4 w-4" />
                        )}
                        Identifier par caméra
                      </Button>
                      {isCameraEnabled && (
                        <Button
                          variant="outline"
                          onClick={disableCamera}
                          disabled={isLoading}
                        >
                          Désactiver
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="url">
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-4">
                      <div>
                        <Input
                          type="url"
                          placeholder="URL de la photo (doit être une data URL)"
                          value={photoUrl || ''}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Description du bonsaï"
                          value={speciesDescription}
                          onChange={(e) => setSpeciesDescription(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => handleIdentifySpecies()}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.search className="mr-2 h-4 w-4" />
                        )}
                        Identifier par URL/Description
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {identificationResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Résultat de l'identification</CardTitle>
                  <CardDescription>
                    Voici les détails de l'espèce identifiée.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="species">
                      <AccordionTrigger>Espèce</AccordionTrigger>
                      <AccordionContent>
                        {identificationResult.species}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="confidence">
                      <AccordionTrigger>Confiance</AccordionTrigger>
                      <AccordionContent>
                        {(identificationResult.confidence * 100).toFixed(0)}%
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="characteristics">
                      <AccordionTrigger>Caractéristiques</AccordionTrigger>
                      <AccordionContent>
                        {identificationResult.characteristics}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {identificationResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Suggestions de taille</CardTitle>
                  <CardDescription>
                    Obtenez des suggestions de taille personnalisées pour
                    votre bonsaï.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <Textarea
                        placeholder="Description de la structure de l'arbre et du placement des branches"
                        value={treeStructure}
                        onChange={(e) => setTreeStructure(e.target.value)}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Quels sont vos objectifs pour le bonsaï (par exemple, mise en forme, santé) ?"
                        value={pruningGoals}
                        onChange={(e) => setPruningGoals(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSuggestPruning} disabled={isLoading}>
                      {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.plus className="mr-2 h-4 w-4" />
                      )}
                      Suggérer une taille
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {pruningSuggestions && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Suggestions de taille</CardTitle>
                  <CardDescription>
                    Voici les suggestions de taille en fonction de vos
                    objectifs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="suggestions">
                      <AccordionTrigger>Suggestions</AccordionTrigger>
                      <AccordionContent>
                        {pruningSuggestions.pruningSuggestions}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="branches">
                      <AccordionTrigger>Branches à tailler</AccordionTrigger>
                      <AccordionContent>
                        {pruningSuggestions.branchIdentifications}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {identificationResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Suggestions de soins</CardTitle>
                  <CardDescription>
                    Obtenez des suggestions de soins personnalisées pour votre
                    bonsaï.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Saison actuelle (ex: Printemps)"
                        value={currentSeason}
                        onChange={(e) => setCurrentSeason(e.target.value)}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="État de santé de l'arbre (ex: feuilles jaunes, croissance lente)"
                        value={treeHealth}
                        onChange={(e) => setTreeHealth(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSuggestCare} disabled={isLoading}>
                      {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.plus className="mr-2 h-4 w-4" />
                      )}
                      Suggérer des soins
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {careSuggestions && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Suggestions de soins</CardTitle>
                  <CardDescription>
                    Voici les suggestions de soins en fonction de la saison et
                    de l'état de santé de votre bonsaï.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{careSuggestions.careSuggestions}</p>
                </CardContent>
              </Card>
            )}

            {/* Section pour Unity */}
            {isLoaded && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Visualisation 3D</CardTitle>
                  <CardDescription>
                    Interagissez avec le modèle 3D de votre bonsaï.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video border rounded-md overflow-hidden">
                    <UnityWebGL.Unity
                      unityProvider={unityProvider as any}
                      style={{width: '100%', height: '100%'}}
                    />
                  </div>
                  {/* Ajouter des boutons ou contrôles pour interagir avec Unity si nécessaire */}
                  {pruningSuggestions && (
                     <Button onClick={() => sendPruningSuggestionsToUnity(pruningSuggestions)} className="mt-2">
                       Afficher les coupes suggérées en 3D
                     </Button>
                   )}
                </CardContent>
              </Card>
            )}
            {!isLoaded && (
               <Card className="mt-4">
                 <CardHeader>
                   <CardTitle>Visualisation 3D</CardTitle>
                 </CardHeader>
                 {loadingErrorCode && (
                  <Alert variant="destructive">Error loading Unity: {loadingErrorCode}</Alert>
                 )}
                 <CardContent>
                   <p>Chargement de la visualisation 3D...</p>
                 </CardContent>
               </Card>
             )}

          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
