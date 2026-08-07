
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="favorites-container" *ngIf="favorites.length > 0">
      <div class="favorites-header">
        <mat-icon>star</mat-icon>
        <span>Favoritos</span>
      </div>
      <div class="favorites-list">
        <div class="favorite-item" *ngFor="let fav of favorites; let i = index" 
             (click)="selectFavorite(fav)">
          <span class="fav-name">{{ fav.name || 'Favorito ' + (i + 1) }}</span>
          <button mat-icon-button (click)="$event.stopPropagation(); removeFavorite(fav)">
            <mat-icon class="remove-icon">close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .favorites-container {
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 100;
      background: rgba(10, 14, 26, 0.95);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(0, 200, 255, 0.15);
      border-radius: 16px;
      padding: 12px 16px;
      min-width: 160px;
      max-width: 220px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.4s ease;
    }
    .favorites-header {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ff6b35;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 107, 53, 0.2);
    }
    .favorites-header mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .favorites-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 160px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .favorites-list::-webkit-scrollbar {
      width: 3px;
    }
    .favorites-list::-webkit-scrollbar-track {
      background: rgba(0, 200, 255, 0.05);
    }
    .favorites-list::-webkit-scrollbar-thumb {
      background: rgba(0, 200, 255, 0.3);
      border-radius: 2px;
    }
    .favorite-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;
      min-height: 28px;
    }
    .favorite-item:hover {
      background: rgba(0, 200, 255, 0.05);
      border-color: rgba(0, 200, 255, 0.1);
      transform: translateX(3px);
    }
    .fav-name {
      color: #fff;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    .remove-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #4a6a8a;
      transition: color 0.3s ease;
    }
    .remove-icon:hover {
      color: #ff6b6b;
    }
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
      .favorites-container {
        bottom: 70px;
        right: 16px;
        left: 16px;
        max-width: none;
        min-width: auto;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  `]
})
export class FavoritesListComponent implements OnInit {
  favorites: any[] = [];

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.locationService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  selectFavorite(fav: any) {
    this.locationService.setLocation({ lat: fav.lat, lng: fav.lng }, fav.name);
    this.weatherService.getWeatherByCoords(fav.lat, fav.lng);
  }

  removeFavorite(fav: any) {
    this.locationService.removeFavorite(fav);
  }
}