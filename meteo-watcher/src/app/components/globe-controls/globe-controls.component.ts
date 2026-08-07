
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-globe-controls',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="globe-controls">
      <button mat-icon-button 
              [class.active]="selectionMode"
              (click)="toggleSelectionMode()"
              class="control-btn"
              title="Seleccionar ubicacion">
        <mat-icon>gps_fixed</mat-icon>
      </button>
      
      <button mat-icon-button 
              (click)="toggleTimeSlider()"
              [class.active]="showSlider"
              class="control-btn"
              title="Linea de tiempo">
        <mat-icon>access_time</mat-icon>
      </button>
      
      <button mat-icon-button 
              (click)="getCurrentLocation()"
              class="control-btn"
              title="Mi ubicacion">
        <mat-icon>home</mat-icon>
      </button>

      <button mat-icon-button 
              (click)="toggleAutoRotate()"
              [class.active]="!isRotating"
              class="control-btn"
              title="Pausar/Reanudar rotacion">
        <mat-icon>{{ isRotating ? 'pause' : 'play_arrow' }}</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .globe-controls {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 100;
      background: rgba(10, 14, 26, 0.85);
      backdrop-filter: blur(10px);
      padding: 10px 20px;
      border-radius: 50px;
      border: 1px solid rgba(0, 200, 255, 0.15);
    }
    .control-btn {
      color: #4a6a8a;
      background: transparent;
      border: none;
      transition: all 0.3s ease;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      min-width: 44px;
      min-height: 44px;
      line-height: 44px;
    }
    .control-btn:hover {
      color: #00c8ff;
      background: rgba(0, 200, 255, 0.15);
      transform: scale(1.1);
    }
    .control-btn.active {
      color: #00c8ff;
      background: rgba(0, 200, 255, 0.2);
      border: 1px solid rgba(0, 200, 255, 0.3);
    }
    .control-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    @media (max-width: 768px) {
      .globe-controls {
        bottom: 20px;
        padding: 8px 14px;
        gap: 8px;
      }
      .control-btn {
        width: 36px;
        height: 36px;
        min-width: 36px;
        min-height: 36px;
        line-height: 36px;
      }
      .control-btn mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
      }
    }
  `]
})
export class GlobeControlsComponent implements OnInit {
  selectionMode = false;
  showSlider = false;
  isRotating = true;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.locationService.selectionMode$.subscribe(mode => {
      this.selectionMode = mode;
    });

    this.locationService.showSlider$.subscribe(show => {
      this.showSlider = show;
    });

    this.locationService.autoRotate$.subscribe(rotating => {
      this.isRotating = rotating;
    });
  }

  toggleSelectionMode() {
    this.locationService.toggleSelectionMode();
  }

  toggleTimeSlider() {
    this.showSlider = !this.showSlider;
    this.locationService.toggleTimeSlider(this.showSlider);
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.locationService.setLocation({ lat: latitude, lng: longitude }, 'Mi Ubicacion');
          this.weatherService.getWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }

  toggleAutoRotate() {
    this.isRotating = !this.isRotating;
    this.locationService.toggleAutoRotate(this.isRotating);
  }
}