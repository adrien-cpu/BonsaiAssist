import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { BonsaiSpecies } from '@/types';

interface SpeciesCardProps {
  species: BonsaiSpecies;
  onClick?: () => void;
}

export function SpeciesCard({ species, onClick }: SpeciesCardProps) {
  const getCareLevel = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  const getLightIcon = (requirement: string) => {
    switch (requirement) {
      case 'high':
        return <Icons.sun className="h-4 w-4 text-yellow-500" />;
      case 'medium':
        return <Icons.cloud className="h-4 w-4 text-gray-500" />;
      case 'low':
        return <Icons.cloud className="h-4 w-4 text-blue-500" />;
      default:
        return <Icons.sun className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {species.commonName}
            </CardTitle>
            <CardDescription className="text-sm italic text-muted-foreground">
              {species.scientificName}
            </CardDescription>
          </div>
          <Icons.tree className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex gap-2 mt-2">
          <Badge className={getCareLevel(species.careLevel)}>
            {species.careLevel}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {species.family}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getLightIcon(species.lightRequirements)}
              <span className="text-muted-foreground">Lumière</span>
            </div>
            <span className="font-medium capitalize">{species.lightRequirements}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icons.droplets className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Arrosage</span>
            </div>
            <span className="font-medium">{species.wateringFrequency}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icons.thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Température</span>
            </div>
            <span className="font-medium">
              {species.optimalTemperature.min}°-{species.optimalTemperature.max}°C
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icons.activity className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Croissance</span>
            </div>
            <span className="font-medium capitalize">{species.growthRate}</span>
          </div>
        </div>

        {species.characteristics.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {species.characteristics.slice(0, 2).join(', ')}
              {species.characteristics.length > 2 && '...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}