
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-time-slider',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="time-slider" *ngIf="daysData && daysData.length > 0">
      <!-- Slider de Fechas -->
      <div class="slider-section">
        <div class="slider-header">
          <span class="slider-title">Fecha</span>
          <span class="slider-time">{{ currentDayLabel }}</span>
        </div>
        <div class="slider-container">
          <button mat-icon-button 
                  (click)="prevDay()" 
                  class="slider-nav"
                  [disabled]="dayIndex === 0">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <input type="range" 
                 [min]="0" 
                 [max]="daysData.length - 1" 
                 [(ngModel)]="dayIndex"
                 (input)="onDayChange()"
                 class="slider-range">
          
          <button mat-icon-button 
                  (click)="nextDay()" 
                  class="slider-nav"
                  [disabled]="dayIndex === daysData.length - 1">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        <div class="slider-markers">
          <span class="marker" *ngFor="let day of daysData; let i = index" 
                [class.active]="i === dayIndex"
                (click)="goToDay(i)">
            {{ day.label }}
          </span>
        </div>
      </div>

      <!-- Slider de Horas - SOLO ILUMINACION -->
      <div class="slider-section">
        <div class="slider-header">
          <span class="slider-title">Hora (Iluminacion)</span>
          <span class="slider-time">{{ currentHourLabel }}</span>
        </div>
        <div class="slider-container">
          <button mat-icon-button 
                  (click)="prevHour()" 
                  class="slider-nav"
                  [disabled]="hourIndex === 0">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <input type="range" 
                 [min]="0" 
                 [max]="23" 
                 [(ngModel)]="hourIndex"
                 (input)="onHourChange()"
                 class="slider-range">
          
          <button mat-icon-button 
                  (click)="nextHour()" 
                  class="slider-nav"
                  [disabled]="hourIndex === 23">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        <div class="slider-markers">
          <span class="marker" *ngFor="let hour of hourLabels; let i = index" 
                [class.active]="i === hourIndex"
                (click)="goToHour(i)">
            {{ hour }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .time-slider {
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 14, 26, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 200, 255, 0.2);
      border-radius: 16px;
      padding: 16px 24px;
      z-index: 50;
      min-width: 400px;
      max-width: 600px;
      animation: slideUp 0.3s ease;
      max-height: 350px;
      overflow-y: auto;
    }
    .slider-section {
      margin-bottom: 16px;
    }
    .slider-section:last-child {
      margin-bottom: 0;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .slider-title {
      color: #4a6a8a;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .slider-time {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }
    .slider-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slider-nav {
      color: #4a6a8a;
      transition: color 0.3s ease;
    }
    .slider-nav:hover:not(:disabled) {
      color: #00c8ff;
    }
    .slider-nav:disabled {
      opacity: 0.3;
    }
    .slider-range {
      flex: 1;
      -webkit-appearance: none;
      background: rgba(0, 200, 255, 0.1);
      height: 4px;
      border-radius: 2px;
      outline: none;
    }
    .slider-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #00c8ff;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 200, 255, 0.3);
    }
    .slider-range::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #00c8ff;
      cursor: pointer;
      border: none;
    }
    .slider-markers {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      padding: 0 20px;
      flex-wrap: wrap;
      gap: 4px;
    }
    .marker {
      color: #4a6a8a;
      font-size: 10px;
      cursor: pointer;
      transition: color 0.3s ease;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .marker:hover {
      color: #fff;
      background: rgba(0, 200, 255, 0.05);
    }
    .marker.active {
      color: #00c8ff;
      background: rgba(0, 200, 255, 0.1);
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @media (max-width: 768px) {
      .time-slider {
        bottom: 80px;
        min-width: auto;
        width: 90%;
        padding: 12px 16px;
        max-height: 280px;
      }
      .slider-markers {
        display: none;
      }
    }
  `]
})
export class TimeSliderComponent implements OnInit {
  @Output() dayChanged = new EventEmitter<{ dt: number, data: any }>();
  @Output() hourChanged = new EventEmitter<{ hour: number }>();

  allData: any[] = [];
  daysData: any[] = [];
  hourLabels: string[] = [];
  
  dayIndex = 0;
  hourIndex = 12; // Default: mediodía
  
  currentDayLabel = '';
  currentHourLabel = '12:00';

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {

    this.hourLabels = Array.from({ length: 24 }, (_, i) => {
      return `${String(i).padStart(2, '0')}:00`;
    });

    this.weatherService.forecastData$.subscribe(data => {
      if (data && data.length > 0) {
        this.allData = data.map((item: any) => ({
          ...item,
          date: new Date(item.dt * 1000),
          label: new Date(item.dt * 1000).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
          })
        }));
        
        this.buildDaysData();
      }
    });
  }

  private buildDaysData() {
    const daysMap = new Map();
    this.allData.forEach(item => {
      const dayKey = item.date.toDateString();
      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, []);
      }
      daysMap.get(dayKey).push(item);
    });

    this.daysData = Array.from(daysMap.keys()).map(key => {
      const items = daysMap.get(key);
      return {
        key: key,
        label: new Date(items[0].dt * 1000).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short'
        }),
        items: items
      };
    });

    this.daysData.sort((a, b) => {
      return new Date(a.key).getTime() - new Date(b.key).getTime();
    });

    this.dayIndex = this.daysData.length - 1;
    this.updateDayLabel();
    this.emitDayChange();
    this.updateHourLabel();
    this.emitHourChange();
  }

  onDayChange() {
    this.updateDayLabel();
    this.emitDayChange();
  }

  onHourChange() {
    this.updateHourLabel();
    this.emitHourChange();
  }

  prevDay() {
    if (this.dayIndex > 0) {
      this.dayIndex--;
      this.updateDayLabel();
      this.emitDayChange();
    }
  }

  nextDay() {
    if (this.dayIndex < this.daysData.length - 1) {
      this.dayIndex++;
      this.updateDayLabel();
      this.emitDayChange();
    }
  }

  goToDay(index: number) {
    this.dayIndex = index;
    this.updateDayLabel();
    this.emitDayChange();
  }

  prevHour() {
    if (this.hourIndex > 0) {
      this.hourIndex--;
      this.updateHourLabel();
      this.emitHourChange();
    }
  }

  nextHour() {
    if (this.hourIndex < 23) {
      this.hourIndex++;
      this.updateHourLabel();
      this.emitHourChange();
    }
  }

  goToHour(index: number) {
    this.hourIndex = index;
    this.updateHourLabel();
    this.emitHourChange();
  }

  private updateDayLabel() {
    if (this.daysData[this.dayIndex]) {
      this.currentDayLabel = this.daysData[this.dayIndex].label;
    }
  }

  private updateHourLabel() {
    this.currentHourLabel = this.hourLabels[this.hourIndex] || '12:00';
  }

  private emitDayChange() {
    const day = this.daysData[this.dayIndex];
    if (day && day.items && day.items.length > 0) {

      const data = day.items[0];
      this.dayChanged.emit({ 
        dt: data.dt,
        data: data 
      });
      this.weatherService.setCurrentForecast(data);
    }
  }

  private emitHourChange() {

    this.hourChanged.emit({ hour: this.hourIndex });
  }
}