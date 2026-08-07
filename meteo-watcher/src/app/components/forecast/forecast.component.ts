
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="forecast-section" *ngIf="forecastData.length > 0">
      <h3>Pronostico 5 Dias</h3>
      <div class="forecast-grid">
        <div class="forecast-day" *ngFor="let day of forecastData">
          <span class="day">{{ day.day }}</span>
          <img [src]="'https://openweathermap.org/img/wn/' + day.icon + '.png'" 
               [alt]="day.description">
          <span class="temp-range">
            <span class="max">{{ getTemperature(day.tempMax) }}°{{ unitSymbol }}</span>
            <span class="min">{{ getTemperature(day.tempMin) }}°{{ unitSymbol }}</span>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forecast-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 2px solid rgba(0, 200, 255, 0.1);
    }
    .forecast-section h3 {
      font-size: 18px;
      font-weight: 300;
      color: #fff;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }
    .forecast-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .forecast-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 4px;
      background: rgba(0, 200, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(0, 200, 255, 0.05);
    }
    .forecast-day .day {
      font-size: 12px;
      color: #4a6a8a;
      font-weight: 500;
    }
    .forecast-day img {
      width: 40px;
      height: 40px;
      margin: 4px 0;
    }
    .forecast-day .temp-range {
      display: flex;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    .forecast-day .max {
      color: #fff;
    }
    .forecast-day .min {
      color: #4a6a8a;
    }
    @media (max-width: 768px) {
      .forecast-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class ForecastComponent implements OnInit {
  forecastData: any[] = [];
  unitSymbol = 'C';

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.weatherService.forecastData$.subscribe(data => {
      if (data && data.length > 0) {
        this.forecastData = data.slice(0, 5).map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('es-ES', { weekday: 'short' }),
          tempMax: item.main.temp_max,
          tempMin: item.main.temp_min,
          icon: item.weather[0].icon,
          description: item.weather[0].description
        }));
      }
    });

    this.weatherService.unit$.subscribe(unit => {
      this.unitSymbol = unit === 'metric' ? 'C' : 'F';
    });
  }

  getTemperature(temp: number): number {
    return this.weatherService.convertTemperature(temp);
  }
}