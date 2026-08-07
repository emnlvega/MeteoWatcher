
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { GlobeComponent } from './components/globe/globe.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    GlobeComponent,
    InfoPanelComponent,
    FavoritesListComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <div class="main-content">
        <div class="side-panel">
          <app-info-panel></app-info-panel>
        </div>
        <div class="globe-wrapper">
          <app-globe></app-globe>
        </div>
      </div>
      <app-favorites-list></app-favorites-list>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }
    .side-panel {
      width: 520px;
      min-width: 520px;
      max-width: 520px;
      background: rgba(10, 14, 26, 0.95);
      backdrop-filter: blur(20px);
      border-right: 2px solid rgba(0, 200, 255, 0.2);
      overflow-y: auto;
      padding: 20px;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
      order: -1;
    }
    .globe-wrapper {
      flex: 1;
      position: relative;
      background: radial-gradient(ellipse at center, #0a0e1a 0%, #000 100%);
      overflow: hidden;
    }
    @media (max-width: 768px) {
      .side-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        height: 55vh;
        border-right: none;
        border-top: 2px solid rgba(0, 200, 255, 0.2);
        padding: 16px;
        z-index: 1000;
        order: 0;
        animation: slideUp 0.3s ease;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    }
  `]
})
export class AppComponent {}