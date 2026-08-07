
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { WeatherService } from '../../services/weather.service';
import { LocationService } from '../../services/location.service';
import { ForecastComponent } from '../forecast/forecast.component';
import { AirQualityComponent } from '../air-quality/air-quality.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ForecastComponent,
    AirQualityComponent
  ],
  template: `
    <div class="info-panel">
      <div *ngIf="!weatherData && !loading" class="empty-state">
        <mat-icon class="empty-icon">explore</mat-icon>
        <h3>Selecciona una ubicacion</h3>
        <p>Haz clic en el globo o usa el modo seleccion</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Cargando datos...</p>
      </div>

      <div *ngIf="weatherData && !loading" class="weather-content">
        <div class="location-header">
          <h2>{{ weatherData.name || 'Ubicacion seleccionada' }}</h2>
          <button mat-icon-button (click)="toggleFavorite()" class="favorite-btn">
            <mat-icon>{{ isFavorite ? 'star' : 'star_border' }}</mat-icon>
          </button>
        </div>

        <!-- Resumen principal -->
        <div class="weather-main">
          <div class="temp-display">
            <span class="temp">{{ getTemperature(displayData?.main?.temp || weatherData.main.temp) }}°{{ unitSymbol }}</span>
            <span class="feels-like">Sensacion: {{ getTemperature(displayData?.main?.feels_like || weatherData.main.feels_like) }}°{{ unitSymbol }}</span>
          </div>
          <div class="weather-icon">
            <img [src]="'https://openweathermap.org/img/wn/' + (displayData?.weather?.[0]?.icon || weatherData.weather[0].icon) + '@2x.png'" 
                 [alt]="displayData?.weather?.[0]?.description || weatherData.weather[0].description">
            <span class="weather-desc">{{ (displayData?.weather?.[0]?.description || weatherData.weather[0].description) | titlecase }}</span>
          </div>
        </div>

        <!-- Temperaturas - Rojo/Naranja -->
        <div class="detail-group group-temperature">
          <div class="group-header">
            <mat-icon>whatshot</mat-icon>
            <span>Temperaturas</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Actual</span>
              <span class="value temp-high">{{ getTemperature(displayData?.main?.temp || weatherData.main.temp) }}°{{ unitSymbol }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Sensacion</span>
              <span class="value temp-mid">{{ getTemperature(displayData?.main?.feels_like || weatherData.main.feels_like) }}°{{ unitSymbol }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Minima</span>
              <span class="value temp-low">{{ getTemperature(displayData?.main?.temp_min || weatherData.main.temp_min) }}°{{ unitSymbol }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Maxima</span>
              <span class="value temp-high">{{ getTemperature(displayData?.main?.temp_max || weatherData.main.temp_max) }}°{{ unitSymbol }}</span>
            </div>
          </div>
        </div>

        <!-- Humedad y Presion - Azul/Cian -->
        <div class="detail-group group-water">
          <div class="group-header">
            <mat-icon>water_drop</mat-icon>
            <span>Humedad & Presion</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Humedad</span>
              <span class="value water-value">{{ displayData?.main?.humidity || weatherData.main.humidity }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">Presion</span>
              <span class="value pressure-value">{{ displayData?.main?.pressure || weatherData.main.pressure }} hPa</span>
            </div>
            <div class="detail-item">
              <span class="label">Nivel Mar</span>
              <span class="value pressure-value">{{ displayData?.main?.sea_level || weatherData.main.sea_level || 'N/A' }} hPa</span>
            </div>
            <div class="detail-item">
              <span class="label">Nivel Suelo</span>
              <span class="value pressure-value">{{ displayData?.main?.grnd_level || weatherData.main.grnd_level || 'N/A' }} hPa</span>
            </div>
          </div>
        </div>

        <!-- Viento - Verde/Cyan -->
        <div class="detail-group group-wind">
          <div class="group-header">
            <mat-icon>air</mat-icon>
            <span>Viento</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Velocidad</span>
              <span class="value wind-value">{{ displayData?.wind?.speed || weatherData.wind.speed }} m/s</span>
            </div>
            <div class="detail-item">
              <span class="label">Direccion</span>
              <span class="value wind-value">{{ displayData?.wind?.deg || weatherData.wind.deg || 'N/A' }}°</span>
            </div>
            <div class="detail-item">
              <span class="label">Racha Max</span>
              <span class="value wind-value">{{ displayData?.wind?.gust || weatherData.wind.gust || 'N/A' }} m/s</span>
            </div>
          </div>
        </div>

        <!-- Visibilidad y Nubes - Violeta/Morado -->
        <div class="detail-group group-clouds">
          <div class="group-header">
            <mat-icon>cloud</mat-icon>
            <span>Visibilidad & Nubes</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Visibilidad</span>
              <span class="value cloud-value">{{ (displayData?.visibility || weatherData.visibility || 10000) / 1000 }} km</span>
            </div>
            <div class="detail-item">
              <span class="label">Nubosidad</span>
              <span class="value cloud-value">{{ displayData?.clouds?.all || weatherData.clouds?.all || 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Sistema Solar - Amarillo/Dorado -->
        <div class="detail-group group-sun">
          <div class="group-header">
            <mat-icon>wb_sunny</mat-icon>
            <span>Sol & Hora</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Amanecer</span>
              <span class="value sun-value">{{ getTimeFromTimestamp(displayData?.sys?.sunrise || weatherData.sys?.sunrise) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Atardecer</span>
              <span class="value sun-value">{{ getTimeFromTimestamp(displayData?.sys?.sunset || weatherData.sys?.sunset) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Huso Horario</span>
              <span class="value sun-value">UTC {{ getTimezone(displayData?.timezone || weatherData.timezone) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Pais</span>
              <span class="value sun-value">{{ displayData?.sys?.country || weatherData.sys?.country || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Coordenadas - Blanco/Gris -->
        <div class="detail-group group-coords">
          <div class="group-header">
            <mat-icon>location_on</mat-icon>
            <span>Coordenadas</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Latitud</span>
              <span class="value coord-value">{{ displayData?.coord?.lat || weatherData.coord?.lat }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Longitud</span>
              <span class="value coord-value">{{ displayData?.coord?.lon || weatherData.coord?.lon }}</span>
            </div>
            <div class="detail-item">
              <span class="label">ID Ciudad</span>
              <span class="value coord-value">{{ displayData?.id || weatherData.id || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <app-forecast></app-forecast>
        <app-air-quality></app-air-quality>
      </div>
    </div>
  `,
  styles: [`
    .info-panel {
      height: 100%;
      padding: 16px 8px;
      overflow-y: auto;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #4a6a8a;
      text-align: center;
    }
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #00c8ff;
      margin-bottom: 16px;
    }
    .empty-state h3 {
      color: #fff;
      margin-bottom: 8px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      color: #4a6a8a;
    }
    .weather-content {
      animation: slideIn 0.5s ease;
    }
    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(0, 200, 255, 0.1);
    }
    .location-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 300;
      color: #fff;
      letter-spacing: 1px;
    }
    .favorite-btn {
      color: #ff6b35;
    }
    .weather-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(0, 200, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(0, 200, 255, 0.1);
    }
    .temp-display {
      display: flex;
      flex-direction: column;
    }
    .temp {
      font-size: 48px;
      font-weight: 200;
      color: #fff;
      line-height: 1;
    }
    .feels-like {
      font-size: 14px;
      color: #4a6a8a;
      margin-top: 4px;
    }
    .weather-icon {
      text-align: center;
    }
    .weather-icon img {
      width: 64px;
      height: 64px;
    }
    .weather-desc {
      display: block;
      font-size: 14px;
      color: #4a6a8a;
      text-transform: capitalize;
    }
    
    /* Grupos de datos */
    .detail-group {
      margin-bottom: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid rgba(0, 200, 255, 0.08);
    }
    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .group-header mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
    }
    .detail-item .label {
      font-size: 11px;
      color: #4a6a8a;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .detail-item .value {
      font-size: 14px;
      font-weight: 600;
    }

    /* Grupo Temperaturas - Rojo/Naranja */
    .group-temperature {
      background: rgba(255, 87, 34, 0.08);
      border-color: rgba(255, 87, 34, 0.2);
    }
    .group-temperature .group-header {
      color: #ff5722;
    }
    .group-temperature .group-header mat-icon {
      color: #ff5722;
    }
    .temp-high { color: #ff5722; }
    .temp-mid { color: #ff9800; }
    .temp-low { color: #ffc107; }

    /* Grupo Humedad - Azul/Cian */
    .group-water {
      background: rgba(0, 150, 255, 0.08);
      border-color: rgba(0, 150, 255, 0.2);
    }
    .group-water .group-header {
      color: #00b0ff;
    }
    .group-water .group-header mat-icon {
      color: #00b0ff;
    }
    .water-value { color: #00b0ff; }
    .pressure-value { color: #4fc3f7; }

    /* Grupo Viento - Verde/Cyan */
    .group-wind {
      background: rgba(0, 230, 118, 0.08);
      border-color: rgba(0, 230, 118, 0.2);
    }
    .group-wind .group-header {
      color: #00e676;
    }
    .group-wind .group-header mat-icon {
      color: #00e676;
    }
    .wind-value { color: #00e676; }

    /* Grupo Nubes - Violeta/Morado */
    .group-clouds {
      background: rgba(156, 39, 176, 0.08);
      border-color: rgba(156, 39, 176, 0.2);
    }
    .group-clouds .group-header {
      color: #ce93d8;
    }
    .group-clouds .group-header mat-icon {
      color: #ce93d8;
    }
    .cloud-value { color: #ce93d8; }

    /* Grupo Sol - Amarillo/Dorado */
    .group-sun {
      background: rgba(255, 215, 0, 0.08);
      border-color: rgba(255, 215, 0, 0.2);
    }
    .group-sun .group-header {
      color: #ffd700;
    }
    .group-sun .group-header mat-icon {
      color: #ffd700;
    }
    .sun-value { color: #ffd700; }

    /* Grupo Coordenadas - Blanco/Gris */
    .group-coords {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .group-coords .group-header {
      color: #90a4ae;
    }
    .group-coords .group-header mat-icon {
      color: #90a4ae;
    }
    .coord-value { color: #b0bec5; }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .temp {
        font-size: 36px;
      }
    }
  `]
})
export class InfoPanelComponent implements OnInit, OnDestroy {
  weatherData: any;
  currentForecast: any = null;
  loading = false;
  isFavorite = false;
  unitSymbol = 'C';
  
  private subscriptions: Subscription[] = [];

  get displayData() {

    return this.currentForecast || this.weatherData;
  }

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.subscriptions.push(
      this.weatherService.weatherData$.subscribe(data => {
        this.weatherData = data;
        this.loading = false;
        if (data && data.name) {
          this.checkFavorite(data.name);
        }

        this.cdr.detectChanges();
      })
    );


    this.subscriptions.push(
      this.weatherService.currentForecast$.subscribe(forecast => {
        if (forecast) {
          this.currentForecast = forecast;
          console.log('Forecast actualizado en panel:', forecast);

          this.cdr.detectChanges();
        }
      })
    );


    this.subscriptions.push(
      this.weatherService.loading$.subscribe(loading => {
        this.loading = loading;
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.push(
      this.weatherService.unit$.subscribe(unit => {
        this.unitSymbol = unit === 'metric' ? 'C' : 'F';
        this.cdr.detectChanges();
      })
    );


    this.subscriptions.push(
      this.locationService.selectedLocation$.subscribe(location => {
        if (location) {
          this.loading = true;
          this.currentForecast = null; // Resetear forecast al cambiar ubicación
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getTemperature(temp: number): number {
    return this.weatherService.convertTemperature(temp);
  }

  getTimeFromTimestamp(timestamp: number): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimezone(offset: number): string {
    if (!offset && offset !== 0) return 'N/A';
    const hours = Math.floor(offset / 3600);
    const minutes = Math.abs((offset % 3600) / 60);
    return `${hours >= 0 ? '+' : ''}${hours}:${String(minutes).padStart(2, '0')}`;
  }

  toggleFavorite() {
    if (this.weatherData) {
      this.locationService.toggleFavorite({
        lat: this.weatherData.coord.lat,
        lng: this.weatherData.coord.lon,
        name: this.weatherData.name
      });
      this.isFavorite = !this.isFavorite;
    }
  }

  private checkFavorite(name: string) {
    const favorites = this.locationService.getFavorites();
    this.isFavorite = favorites.some(f => f.name === name);
  }
}