import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { SuggestPruningOutput } from '@/ai/flows/suggest-pruning';

interface PruningGuideProps {
  suggestions: SuggestPruningOutput;
  onApplyPruning?: (branchId: string) => void;
  onSaveSession?: () => void;
}

export function PruningGuide({ suggestions, onApplyPruning, onSaveSession }: PruningGuideProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const branchList = suggestions.branchIdentifications
    .split('\n')
    .filter(line => line.trim())
    .map((line, index) => ({
      id: `branch-${index}`,
      description: line.trim(),
      isSelected: selectedBranches.includes(`branch-${index}`),
    }));

  const pruningSteps = suggestions.pruningSuggestions
    .split('\n')
    .filter(line => line.trim())
    .map((step, index) => ({
      id: index,
      title: `Étape ${index + 1}`,
      description: step.trim(),
      isCompleted: index < currentStep,
    }));

  const toggleBranchSelection = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleApplyPruning = (branchId: string) => {
    onApplyPruning?.(branchId);
    setSelectedBranches(prev => prev.filter(id => id !== branchId));
  };

  const nextStep = () => {
    if (currentStep < pruningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.scissors className="h-5 w-5" />
          Guide de taille
        </CardTitle>
        <CardDescription>
          Suivez les recommandations IA pour tailler votre bonsaï
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="branches" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="branches">Branches à tailler</TabsTrigger>
            <TabsTrigger value="steps">Étapes détaillées</TabsTrigger>
          </TabsList>

          <TabsContent value="branches" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Branches identifiées</h3>
              <Badge variant="outline">
                {branchList.length} branche(s)
              </Badge>
            </div>

            <div className="space-y-3">
              {branchList.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    branch.isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleBranchSelection(branch.id)}
                      className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        branch.isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {branch.isSelected && (
                        <Icons.success className="h-3 w-3" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className="text-sm">{branch.description}</p>
                    </div>

                    {branch.isSelected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyPruning(branch.id)}
                        className="text-xs"
                      >
                        <Icons.scissors className="h-3 w-3 mr-1" />
                        Tailler
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedBranches(branchList.map(b => b.id))}
                size="sm"
              >
                Tout sélectionner
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedBranches([])}
                size="sm"
              >
                Tout désélectionner
              </Button>
              <Button
                onClick={onSaveSession}
                size="sm"
                className="ml-auto"
              >
                <Icons.save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Instructions détaillées</h3>
              <Badge variant="outline">
                Étape {currentStep + 1} sur {pruningSteps.length}
              </Badge>
            </div>

            {pruningSteps.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      pruningSteps[currentStep].isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {currentStep + 1}
                    </div>
                    <h4 className="font-medium">{pruningSteps[currentStep].title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pruningSteps[currentStep].description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    size="sm"
                  >
                    <Icons.chevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>

                  <div className="flex gap-1">
                    {pruningSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-primary'
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={nextStep}
                    disabled={currentStep === pruningSteps.length - 1}
                    size="sm"
                  >
                    Suivant
                    <Icons.chevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}