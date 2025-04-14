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
            console.error('Error accessing camera:', err);
            setHasCameraPermission(false);
            setIsCameraEnabled(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
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
                                Account
                            </SidebarGroupLabel>
                        </SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <User className="mr-2 h-4 w-4"/>
                                Profile
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Settings className="mr-2 h-4 w-4"/>
                                Settings
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Shield className="mr-2 h-4 w-4"/>
                                Privacy
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Trash className="mr-2 h-4 w-4"/>
                                Trash
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarSeparator/>
                        <SidebarFooter>
                            <p className="text-xs text-muted-foreground">
                                Make beautiful websites regardless of your design experience.
                            </p>
                        </SidebarFooter>
                    </SidebarContent>
                    <SidebarRail/>
                </Sidebar>
                <SidebarInset className="flex flex-col">
                    <div className="container mx-auto p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Camera View</CardTitle>
                                <CardDescription>View your bonsai with your camera</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted/>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" disabled={isLoading} onClick={toggleCamera}>
                                            {isCameraEnabled ? (
                                                <>
                                                    <Camera className="mr-2 h-4 w-4"/>
                                                    Disable Camera
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="mr-2 h-4 w-4"/>
                                                    Enable Camera
                                                </>
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to enable the camera?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Enabling the camera will allow the app to access your device's camera.
                                                Please ensure you have granted the necessary permissions.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => {
                                                enableCamera();
                                                setOpen(false);
                                            }}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {!(hasCameraPermission) && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera access to use this feature.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Bonsai Identification</CardTitle>
                                <CardDescription>Identify the species of your bonsai</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {error &&
                                    <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                                <div className="grid gap-4">
                                    <div>
                                        <Input
                                            type="url"
                                            placeholder="Photo URL"
                                            value={photoUrl || ''}
                                            onChange={(e) => setPhotoUrl(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Textarea
                                            placeholder="Description of the bonsai"
                                            value={speciesDescription}
                                            onChange={(e) => setSpeciesDescription(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleIdentifySpecies} disabled={isLoading}>
                                        {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/> :
                                            <Icons.search className="mr-2 h-4 w-4"/>}
                                        Identify Species
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {identificationResult && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identification Result</CardTitle>
                                    <CardDescription>Here are the details of the identified species</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="species">
                                            <AccordionTrigger>Species</AccordionTrigger>
                                            <AccordionContent>{identificationResult.species}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="confidence">
                                            <AccordionTrigger>Confidence</AccordionTrigger>
                                            <AccordionContent>{identificationResult.confidence}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="characteristics">
                                            <AccordionTrigger>Characteristics</AccordionTrigger>
                                            <AccordionContent>{identificationResult.characteristics}</AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pruning Suggestions</CardTitle>
                                <CardDescription>Get personalized pruning suggestions for your bonsai</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <Textarea
                                            placeholder="What are your goals for the bonsai (e.g., shaping, health)?"
                                            value={pruningGoals}
                                            onChange={(e) => setPruningGoals(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleSuggestPruning} disabled={isLoading}>
                                        {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/> :
                                            <Icons.plus className="mr-2 h-4 w-4"/>}
                                        Suggest Pruning
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {pruningSuggestions && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pruning Suggestions</CardTitle>
                                    <CardDescription>Here are the pruning suggestions based on your goals</CardDescription>
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
