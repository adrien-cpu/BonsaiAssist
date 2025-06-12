import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { WeatherData } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeatherWidgetProps {
  weather: WeatherData;
  location?: string;
}

export function WeatherWidget({ weather, location }: WeatherWidgetProps) {
  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) {
      return <Icons.sun className="h-8 w-8 text-yellow-500" />;
    } else if (condition.includes('cloud')) {
      return <Icons.cloud className="h-8 w-8 text-gray-500" />;
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return <Icons.rain className="h-8 w-8 text-blue-500" />;
    }
    return <Icons.cloud className="h-8 w-8 text-gray-500" />;
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Faible', color: 'bg-green-100 text-green-800' };
    if (uvIndex <= 5) return { level: 'Modéré', color: 'bg-yellow-100 text-yellow-800' };
    if (uvIndex <= 7) return { level: 'Élevé', color: 'bg-orange-100 text-orange-800' };
    if (uvIndex <= 10) return { level: 'Très élevé', color: 'bg-red-100 text-red-800' };
    return { level: 'Extrême', color: 'bg-purple-100 text-purple-800' };
  };

  const uvLevel = getUVLevel(weather.uvIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.cloud className="h-5 w-5" />
          Météo actuelle
        </CardTitle>
        {location && (
          <CardDescription className="flex items-center gap-1">
            <Icons.mapPin className="h-4 w-4" />
            {location}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.conditions)}
              <div>
                <div className="text-2xl font-bold">{weather.temperature}°C</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {weather.conditions}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Icons.droplets className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Humidité</span>
              <span className="font-medium ml-auto">{weather.humidity}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Icons.wind className="h-4 w-4 text-gray-500" />
              <span className="text-muted-foreground">Vent</span>
              <span className="font-medium ml-auto">{weather.windSpeed} km/h</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Icons.activity className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Pression</span>
              <span className="font-medium ml-auto">{weather.pressure} hPa</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Icons.sun className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">UV</span>
              <Badge size="sm" className={uvLevel.color}>
                {uvLevel.level}
              </Badge>
            </div>
          </div>

          {/* Forecast */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Prévisions 3 jours</h4>
            <div className="space-y-2">
              {weather.forecast.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.conditions)}
                    <span className="font-medium">
                      {format(day.date, 'EEE dd', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {day.temperature.min}°/{day.temperature.max}°
                    </span>
                    <Icons.droplets className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{day.humidity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}