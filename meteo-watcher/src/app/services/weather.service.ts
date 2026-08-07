
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '8079705f6e2a5b987b4d8daa49515f8c';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  private weatherDataSubject = new BehaviorSubject<any>(null);
  weatherData$ = this.weatherDataSubject.asObservable();

  private forecastDataSubject = new BehaviorSubject<any[]>([]);
  forecastData$ = this.forecastDataSubject.asObservable();

  private airQualitySubject = new BehaviorSubject<any>(null);
  airQuality$ = this.airQualitySubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private unitSubject = new BehaviorSubject<string>('metric');
  unit$ = this.unitSubject.asObservable();

  private currentForecastSubject = new BehaviorSubject<any>(null);
  currentForecast$ = this.currentForecastSubject.asObservable();

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {}

  searchCity(query: string): void {
    if (!query.trim()) return;
    
    const coordsMatch = query.match(/^([-+]?\d+\.?\d*)\s*,\s*([-+]?\d+\.?\d*)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        this.locationService.setLocation({ lat, lng });
        this.getWeatherByCoords(lat, lng);
        return;
      }
    }
    
    this.http.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: query,
        limit: 1,
        appid: this.apiKey
      }
    }).pipe(
      tap((data: any) => {
        if (data && data.length > 0) {
          const location = data[0];
          const lat = location.lat;
          const lng = location.lon;
          this.locationService.setLocation({ lat, lng }, location.name);
          this.getWeatherByCoords(lat, lng);
        }
      }),
      catchError(error => {
        console.error('Search error:', error);
        return [];
      })
    ).subscribe();
  }

 getWeatherByCoords(lat: number, lng: number): void {
  this.loadingSubject.next(true);
  
  // Usar reverseGeocode para obtener el nombre correcto
  this.reverseGeocode(lat, lng).subscribe({
    next: (cityName) => {
      const currentLocation = this.weatherDataSubject.value;
      if (currentLocation) {
        this.weatherDataSubject.next({ ...currentLocation, name: cityName });
      }
    },
    error: () => {}
  });

    this.http.get(`${this.baseUrl}/weather`, {
      params: {
        lat: lat.toString(),
        lon: lng.toString(),
        units: this.unitSubject.value,
        appid: this.apiKey
      }
    }).pipe(
      tap((data: any) => {
        this.weatherDataSubject.next(data);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Weather error:', error);
        this.loadingSubject.next(false);
        return [];
      })
    ).subscribe();

    this.http.get(`${this.baseUrl}/forecast`, {
      params: {
        lat: lat.toString(),
        lon: lng.toString(),
        units: this.unitSubject.value,
        appid: this.apiKey
      }
    }).pipe(
      tap((data: any) => {
        if (data && data.list) {
          const dailyForecast = data.list.filter((_: any, index: number) => index % 8 === 0);
          this.forecastDataSubject.next(dailyForecast);
          if (dailyForecast.length > 0) {
            this.currentForecastSubject.next(dailyForecast[dailyForecast.length - 1]);
          }
        }
      }),
      catchError(error => {
        console.error('Forecast error:', error);
        return [];
      })
    ).subscribe();

    this.http.get(`${this.baseUrl}/air_pollution`, {
      params: {
        lat: lat.toString(),
        lon: lng.toString(),
        appid: this.apiKey
      }
    }).pipe(
      tap((data: any) => {
        this.airQualitySubject.next(data);
      }),
      catchError(error => {
        console.error('Air quality error:', error);
        return [];
      })
    ).subscribe();
  }


// app/services/weather.service.ts - reverseGeocode mejorado
// app/services/weather.service.ts - reverseGeocode con tipos
public reverseGeocode(lat: number, lng: number): Observable<string> {
  return this.http.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
    params: {
      lat: lat.toString(),
      lon: lng.toString(),
      limit: 10,
      appid: this.apiKey
    }
  }).pipe(
    map((data: any) => {
      if (data && data.length > 0) {
        // Función para calcular distancia entre coordenadas
        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        // Agrupar resultados por nombre para evitar duplicados
        const nameMap = new Map<string, { name: string; distance: number; population: number }>();
        
        data.forEach((location: any) => {
          const name = location.name || '';
          const localNames = location.local_names || {};
          const spanishName = localNames.es || name;
          
          // Calcular distancia desde el punto original
          const distance = getDistance(lat, lng, location.lat, location.lon);
          
          if (!nameMap.has(spanishName) || distance < nameMap.get(spanishName)!.distance) {
            nameMap.set(spanishName, {
              name: spanishName,
              distance: distance,
              population: location.population || 0
            });
          }
        });

        // Convertir a array y ordenar
        const results = Array.from(nameMap.values());
        
        // Ordenar por: 1. Distancia, 2. Población (ciudades más grandes primero)
        results.sort((a, b) => {
          // Si un nombre es más corto (posiblemente localidad pequeña) dar prioridad a nombres más largos
          const aIsShort = a.name.length < 6;
          const bIsShort = b.name.length < 6;
          
          if (aIsShort && !bIsShort) return 1;
          if (!aIsShort && bIsShort) return -1;
          
          // Si ambos son cortos o largos, ordenar por distancia
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
          
          // Si misma distancia, priorizar mayor población
          return (b.population || 0) - (a.population || 0);
        });

        return results[0]?.name || data[0].name || '';
      }
      return '';
    }),
    catchError(() => {
      return of('');
    })
  );
}

  toggleUnit(): void {
    const newUnit = this.unitSubject.value === 'metric' ? 'imperial' : 'metric';
    this.unitSubject.next(newUnit);
    
    const location = this.weatherDataSubject.value;
    if (location && location.coord) {
      this.getWeatherByCoords(location.coord.lat, location.coord.lon);
    }
  }

  setUnit(unit: string): void {
    this.unitSubject.next(unit);
    
    const location = this.weatherDataSubject.value;
    if (location && location.coord) {
      this.getWeatherByCoords(location.coord.lat, location.coord.lon);
    }
  }

  convertTemperature(temp: number): number {
    if (this.unitSubject.value === 'imperial') {
      return Math.round((temp * 9 / 5) + 32);
    }
    return Math.round(temp);
  }

  setCurrentForecast(forecast: any): void {
    this.currentForecastSubject.next(forecast);
  }
}