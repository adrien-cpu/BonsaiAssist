"use client"

import * as React from "react"
import {
    Check,
    Home,
    MessageSquare,
    PlusCircle,
    Settings,
    Share2,
    Shield,
    Trash,
    User,
    Camera
} from "lucide-react";

import {useIsMobile} from "@/hooks/use-mobile"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Separator} from "@/components/ui/separator"
import {Sheet, SheetContent} from "@/components/ui/sheet"
import {Skeleton} from "@/components/ui/skeleton"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import {Icons} from "@/components/icons";
import {identifySpecies, IdentifySpeciesOutput} from "@/ai/flows/identify-species";
import {suggestPruning, SuggestPruningOutput} from "@/ai/flows/suggest-pruning";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "@/hooks/use-toast";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";

export default function IndexPage() {
    const [speciesDescription, setSpeciesDescription] = React.useState('');
    const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
    const [identificationResult, setIdentificationResult] = React.useState<IdentifySpeciesOutput | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [pruningGoals, setPruningGoals] = React.useState('');
    const [pruningSuggestions, setPruningSuggestions] = React.useState<SuggestPruningOutput | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = React.useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [open, setOpen] = React.useState(false)

    const toggleCamera = async () => {
        if (!isCameraEnabled) {
            setOpen(true);
        } else {
            setIsCameraEnabled(false);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
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
        } catch (err) {
            console.error('Erreur lors de l\'accès à la caméra :', err);
            setHasCameraPermission(false);
            setIsCameraEnabled(false);
            toast({
                variant: 'destructive',
                title: 'Accès à la caméra refusé',
                description: 'Veuillez activer les autorisations de la caméra dans les paramètres de votre navigateur pour utiliser cette application.',
            });
        }
    };

    React.useEffect(() => {
        if (isCameraEnabled) {
            enableCamera();
        }
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraEnabled]);


    const handleIdentifySpecies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!photoUrl) {
                setError('Veuillez fournir l\'URL d\'une photo.');
                return;
            }
            const result = await identifySpecies({photoUrl, description: speciesDescription});
            setIdentificationResult(result); // Met à jour l'état avec le résultat
        } catch (err) {
            console.error('Erreur lors de l\'identification de l\'espèce :', err);
            setError('Échec de l\'identification de l\'espèce. Veuillez vérifier les entrées et réessayer.'); // Met à jour l'état d'erreur
        }
        setIsLoading(false); // Désactive l'indicateur de chargement
    };

    const handleSuggestPruning = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!identificationResult?.species) {
                setError('Veuillez identifier l\'espèce avant de demander des suggestions de taille.');
                return;
            }
            const result = await suggestPruning({
                species: identificationResult.species,
                userGoals: pruningGoals,
                bonsaiDescription: speciesDescription,
            });
            setPruningSuggestions(result);
        } catch (err) {
            console.error('Erreur lors de la suggestion de taille :', err);
            setError('Échec de la suggestion de taille. Veuillez vérifier les entrées et réessayer.');
        }
        setIsLoading(false);
    };

    return (
        <main className="flex h-screen antialiased text-foreground bg-background">
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Home className="mr-2 h-4 w-4"/>
                                    Toggle Sidebar
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarSeparator/>
                        <SidebarHeader>
                            <SidebarGroupLabel>
                                BonsAI Assist
                            </SidebarGroupLabel>
                        </SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={true}>
                                    <Icons.search className="mr-2 h-4 w-4"/>
                                    Identifier l'espèce
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Guide de taille
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Share2 className="mr-2 h-4 w-4"/>
                                Visualisation 3D
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarSeparator/>
                        <SidebarHeader>
                            <SidebarGroupLabel>
                                Compte
                            </SidebarGroupLabel>
                        </SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <User className="mr-2 h-4 w-4"/>
                                Profil
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Settings className="mr-2 h-4 w-4"/>
                                Paramètres
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Shield className="mr-2 h-4 w-4"/>
                                Confidentialité
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Trash className="mr-2 h-4 w-4"/>
                                Corbeille
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarSeparator/>
                        <SidebarFooter>
                            <p className="text-xs text-muted-foreground">
                                Créez de magnifiques sites web, quelle que soit votre expérience en design.
                            </p>
                        </SidebarFooter>
                    </SidebarContent>
                    <SidebarRail/>
                </Sidebar>
                <SidebarInset className="flex flex-col">
                    <div className="container mx-auto p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vue Caméra</CardTitle>
                                <CardDescription>Visualisez votre bonsaï avec votre caméra</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted/>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" disabled={isLoading} onClick={toggleCamera}>
                                            {isCameraEnabled ? (
                                                <>
                                                    <Camera className="mr-2 h-4 w-4"/>
                                                    Désactiver la caméra
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="mr-2 h-4 w-4"/>
                                                    Activer la caméra
                                                </>
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Êtes-vous sûr de vouloir activer la caméra ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                L'activation de la caméra permettra à l'application d'accéder à la caméra de votre appareil.
                                                Veuillez vous assurer que vous avez accordé les autorisations nécessaires.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setOpen(false)}>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => {
                                                enableCamera();
                                                setOpen(false);
                                            }}>Continuer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {!(hasCameraPermission) && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Accès à la caméra requis</AlertTitle>
                                        <AlertDescription>
                                            Veuillez autoriser l'accès à la caméra pour utiliser cette fonctionnalité.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Identification du Bonsaï</CardTitle>
                                <CardDescription>Identifiez l'espèce de votre bonsaï</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {error &&
                                    <Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                                <div className="grid gap-4">
                                    <div>
                                        <Input
                                            type="url"
                                            placeholder="URL de la photo"
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
                                    <Button onClick={handleIdentifySpecies} disabled={isLoading}>
                                        {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/> :
                                            <Icons.search className="mr-2 h-4 w-4"/>}
                                        Identifier l'espèce
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {identificationResult && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Résultat de l'identification</CardTitle>
                                    <CardDescription>Voici les détails de l'espèce identifiée</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="species">
                                            <AccordionTrigger>Espèce</AccordionTrigger>
                                            <AccordionContent>{identificationResult.species}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="confidence">
                                            <AccordionTrigger>Confiance</AccordionTrigger>
                                            <AccordionContent>{identificationResult.confidence}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="characteristics">
                                            <AccordionTrigger>Caractéristiques</AccordionTrigger>
                                            <AccordionContent>{identificationResult.characteristics}</AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle>Suggestions de taille</CardTitle>
                                <CardDescription>Obtenez des suggestions de taille personnalisées pour votre bonsaï</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <Textarea
                                            placeholder="Quels sont vos objectifs pour le bonsaï (par exemple, mise en forme, santé) ?"
                                            value={pruningGoals}
                                            onChange={(e) => setPruningGoals(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleSuggestPruning} disabled={isLoading}>
                                        {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/> :
                                            <Icons.plus className="mr-2 h-4 w-4"/>}
                                        Suggérer une taille
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {pruningSuggestions && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Suggestions de taille</CardTitle>
                                    <CardDescription>Voici les suggestions de taille en fonction de vos objectifs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>{pruningSuggestions.pruningSuggestions}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </main>
    );
}
