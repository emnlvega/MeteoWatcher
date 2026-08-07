
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-air-quality',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="air-quality-section" *ngIf="airQualityData">
      <h3>Calidad del Aire</h3>
      <div class="aqi-display">
        <div class="aqi-value" [class]="getAqiClass()">
          <span class="aqi-number">{{ airQualityData.list[0].main.aqi }}</span>
          <span class="aqi-label">{{ getAqiLabel() }}</span>
        </div>
        <div class="aqi-components">
          <div class="component" *ngFor="let component of getComponents()">
            <span class="component-name">{{ component.name }}</span>
            <span class="component-value">{{ component.value }} {{ component.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .air-quality-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid rgba(0, 200, 255, 0.1);
    }
    .air-quality-section h3 {
      font-size: 18px;
      font-weight: 300;
      color: #fff;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }
    .aqi-display {
      display: flex;
      gap: 20px;
      padding: 16px;
      background: rgba(0, 200, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(0, 200, 255, 0.05);
    }
    .aqi-value {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 24px;
      border-radius: 8px;
      min-width: 80px;
    }
    .aqi-value .aqi-number {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }
    .aqi-value .aqi-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4a6a8a;
      margin-top: 4px;
    }
    /* Colores más vibrantes */
    .aqi-value.good { 
      background: rgba(0, 230, 118, 0.35); 
      border: 2px solid rgba(0, 230, 118, 0.5);
      box-shadow: 0 0 20px rgba(0, 230, 118, 0.2);
    }
    .aqi-value.good .aqi-label { color: #00e676; }
    
    .aqi-value.fair { 
      background: rgba(255, 235, 59, 0.35); 
      border: 2px solid rgba(255, 235, 59, 0.5);
      box-shadow: 0 0 20px rgba(255, 235, 59, 0.2);
    }
    .aqi-value.fair .aqi-label { color: #ffeb3b; }
    
    .aqi-value.moderate { 
      background: rgba(255, 193, 7, 0.35); 
      border: 2px solid rgba(255, 193, 7, 0.5);
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
    }
    .aqi-value.moderate .aqi-label { color: #ffc107; }
    
    .aqi-value.poor { 
      background: rgba(255, 152, 0, 0.35); 
      border: 2px solid rgba(255, 152, 0, 0.5);
      box-shadow: 0 0 20px rgba(255, 152, 0, 0.2);
    }
    .aqi-value.poor .aqi-label { color: #ff9800; }
    
    .aqi-value.very-poor { 
      background: rgba(244, 67, 54, 0.35); 
      border: 2px solid rgba(244, 67, 54, 0.5);
      box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
    }
    .aqi-value.very-poor .aqi-label { color: #f44336; }
    
    .aqi-components {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .component {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      background: rgba(0, 200, 255, 0.05);
      border-radius: 4px;
      font-size: 12px;
    }
    .component-name {
      color: #4a6a8a;
      text-transform: uppercase;
    }
    .component-value {
      color: #fff;
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .aqi-display {
        flex-direction: column;
      }
      .aqi-components {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class AirQualityComponent implements OnInit {
  airQualityData: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.weatherService.airQuality$.subscribe(data => {
      this.airQualityData = data;
    });
  }

  getAqiLabel(): string {
    if (!this.airQualityData) return '';
    const aqi = this.airQualityData.list[0].main.aqi;
    const labels = ['', 'Buena', 'Aceptable', 'Moderada', 'Mala', 'Muy Mala'];
    return labels[aqi] || '';
  }

  getAqiClass(): string {
    if (!this.airQualityData) return '';
    const aqi = this.airQualityData.list[0].main.aqi;
    const classes = ['', 'good', 'fair', 'moderate', 'poor', 'very-poor'];
    return classes[aqi] || '';
  }

  getComponents(): any[] {
    if (!this.airQualityData) return [];
    const components = this.airQualityData.list[0].components;
    return [
      { name: 'PM2.5', value: components.pm2_5, unit: 'μg/m³' },
      { name: 'PM10', value: components.pm10, unit: 'μg/m³' },
      { name: 'NO2', value: components.no2, unit: 'μg/m³' },
      { name: 'O3', value: components.o3, unit: 'μg/m³' },
      { name: 'CO', value: components.co, unit: 'μg/m³' },
      { name: 'SO2', value: components.so2, unit: 'μg/m³' }
    ];
  }
}