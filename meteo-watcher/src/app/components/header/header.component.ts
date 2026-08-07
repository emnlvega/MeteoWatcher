
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSelectModule, MatInputModule, FormsModule],
  template: `
    <header class="header">
      <div class="logo-section">
        <span class="logo-text">Meteo<span class="highlight">Watcher</span></span>
      </div>
      
      <div class="controls">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (keyup.enter)="searchLocation()"
            placeholder="Buscar ciudad o coordenadas (ej: 32.4,-116.9)..."
            class="search-input">
          <button mat-icon-button (click)="searchLocation()" class="search-btn">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
        
        <div class="unit-selector">
          <mat-select 
            [(ngModel)]="selectedUnit"
            (selectionChange)="onUnitChange()"
            class="unit-dropdown">
            <mat-option value="metric">°C</mat-option>
            <mat-option value="imperial">°F</mat-option>
          </mat-select>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(10, 14, 26, 0.98);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(0, 200, 255, 0.15);
      z-index: 1000;
      position: relative;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 2px;
      color: #ffffff;
    }
    .logo-text .highlight {
      font-weight: 700;
      color: #00c8ff;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      max-width: 600px;
    }
    .search-box {
      display: flex;
      align-items: center;
      flex: 1;
      background: rgba(0, 200, 255, 0.05);
      border: 1px solid rgba(0, 200, 255, 0.1);
      border-radius: 8px;
      padding: 4px 8px;
      transition: all 0.3s ease;
    }
    .search-box:focus-within {
      border-color: rgba(0, 200, 255, 0.3);
      background: rgba(0, 200, 255, 0.08);
    }
    .search-icon {
      color: #4a6a8a;
      font-size: 20px;
      margin-right: 8px;
    }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #fff;
      padding: 8px 0;
      font-size: 14px;
      outline: none;
    }
    .search-input::placeholder {
      color: #4a6a8a;
    }
    .search-btn {
      color: #4a6a8a;
      transition: color 0.3s ease;
    }
    .search-btn:hover {
      color: #00c8ff;
    }
    .unit-selector {
      flex-shrink: 0;
    }
    .unit-dropdown {
      background: rgba(0, 200, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 200, 255, 0.1);
      padding: 4px 8px;
      color: #fff;
      font-size: 14px;
      min-width: 50px;
    }
    ::ng-deep .unit-dropdown .mat-select-value {
      color: #fff;
    }
    ::ng-deep .unit-dropdown .mat-select-arrow {
      color: #4a6a8a;
    }
    ::ng-deep .mat-select-panel {
      background: rgba(10, 14, 26, 0.98);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 200, 255, 0.15);
    }
    ::ng-deep .mat-option {
      color: #fff;
    }
    ::ng-deep .mat-option:hover {
      background: rgba(0, 200, 255, 0.1);
    }
    ::ng-deep .mat-option.mat-selected {
      color: #00c8ff;
    }
    @media (max-width: 768px) {
      .header { padding: 8px 12px; flex-wrap: wrap; gap: 8px; }
      .logo-text { font-size: 18px; }
      .controls { max-width: 100%; flex-wrap: wrap; }
      .search-box { min-width: 150px; }
      .search-input { font-size: 12px; }
      .unit-dropdown { min-width: 40px; font-size: 12px; padding: 2px 4px; }
    }
  `]
})
export class HeaderComponent {
  searchQuery = '';
  selectedUnit = 'metric';

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService
  ) {
    this.weatherService.unit$.subscribe(unit => {
      this.selectedUnit = unit;
    });
  }

  searchLocation() {
    if (!this.searchQuery.trim()) return;
    this.weatherService.searchCity(this.searchQuery.trim());
  }

  onUnitChange() {
    console.log('Unit selected:', this.selectedUnit);
    this.weatherService.setUnit(this.selectedUnit);
  }
}