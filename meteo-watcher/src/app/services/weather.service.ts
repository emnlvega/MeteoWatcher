
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


private reverseGeocode(lat: number, lng: number): Observable<string> {
  return this.http.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
    params: {
      lat: lat.toString(),
      lon: lng.toString(),
      limit: 5, // Aumentar límite para obtener más resultados
      appid: this.apiKey
    }
  }).pipe(
    map((data: any) => {
      if (data && data.length > 0) {


        for (const location of data) {

          if (location.name && location.country) {

            if (location.local_names && location.local_names.es) {
              return location.local_names.es; // Nombre en español
            }
            return location.name;
          }
        }

        return data[0].name || '';
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