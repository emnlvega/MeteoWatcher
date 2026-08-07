
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="tutorial-container">
      <button mat-icon-button 
              (click)="showTutorial = !showTutorial"
              class="tutorial-btn"
              title="Ayuda">
        <mat-icon>help_outline</mat-icon>
      </button>
      
      <div class="tutorial-panel" *ngIf="showTutorial">
        <div class="tutorial-header">
          <span class="tutorial-title">Como usar MeteoWatcher</span>
          <button mat-icon-button (click)="showTutorial = false" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="tutorial-content">
          <!-- Seleccionar ubicacion -->
          <div class="tutorial-item">
            <mat-icon class="icon-gps">gps_fixed</mat-icon>
            <div>
              <strong>Seleccionar ubicacion</strong>
              <p>Activa el modo seleccion y haz click en el globo. Tambien puedes hacer doble click directamente sobre el globo.</p>
            </div>
          </div>

          <!-- Linea de tiempo -->
          <div class="tutorial-item">
            <mat-icon class="icon-time">access_time</mat-icon>
            <div>
              <strong>Linea de tiempo</strong>
              <p>Visualiza el historial de clima. El slider de <span class="highlight-text">Fecha</span> cambia los datos del clima. El slider de <span class="highlight-text">Hora</span> cambia la iluminacion del globo.</p>
            </div>
          </div>

          <!-- Mi ubicacion -->
          <div class="tutorial-item">
            <mat-icon class="icon-home">home</mat-icon>
            <div>
              <strong>Mi ubicacion</strong>
              <p>Usa tu ubicacion actual para ver el clima en tiempo real.</p>
            </div>
          </div>

          <!-- Favoritos -->
          <div class="tutorial-item">
            <mat-icon class="icon-star">star</mat-icon>
            <div>
              <strong>Favoritos</strong>
              <p>Guarda tus lugares favoritos para acceder rapidamente. Aparecen como marcadores naranja en el globo.</p>
            </div>
          </div>

          <!-- Buscar -->
          <div class="tutorial-item">
            <mat-icon class="icon-search">search</mat-icon>
            <div>
              <strong>Buscar</strong>
              <p>Busca por nombre de ciudad o coordenadas (ejemplo: 32.4,-116.9).</p>
            </div>
          </div>

          <!-- Panel de informacion -->
          <div class="tutorial-item">
            <mat-icon class="icon-info">info</mat-icon>
            <div>
              <strong>Panel de informacion</strong>
              <p>Muestra todos los datos del clima: temperaturas, humedad, presion, viento, visibilidad, nubosidad, amanecer, atardecer y coordenadas.</p>
            </div>
          </div>

          <!-- Calidad del aire -->
          <div class="tutorial-item">
            <mat-icon class="icon-air">air</mat-icon>
            <div>
              <strong>Calidad del aire</strong>
              <p>Muestra el indice de calidad del aire (AQI) y los niveles de contaminantes: PM2.5, PM10, NO2, O3, CO, SO2.</p>
            </div>
          </div>

          <!-- Pronostico -->
          <div class="tutorial-item">
            <mat-icon class="icon-forecast">calendar_today</mat-icon>
            <div>
              <strong>Pronostico</strong>
              <p>Visualiza el pronostico de 5 dias con temperaturas maxima y minima.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tutorial-container {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tutorial-btn {
      color: #4a6a8a;
      background: rgba(10, 14, 26, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 200, 255, 0.15);
      transition: all 0.3s ease;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      min-width: 40px;
      min-height: 40px;
    }
    .tutorial-btn:hover {
      color: #00c8ff;
      background: rgba(0, 200, 255, 0.15);
      border-color: rgba(0, 200, 255, 0.3);
      transform: scale(1.1);
    }
    .tutorial-btn mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      line-height: 22px;
    }
    .tutorial-panel {
      position: absolute;
      top: 50px;
      right: 0;
      width: 360px;
      max-height: 500px;
      background: rgba(10, 14, 26, 0.97);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 200, 255, 0.2);
      border-radius: 16px;
      padding: 16px 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      animation: slideDown 0.3s ease;
      overflow-y: auto;
    }
    .tutorial-panel::-webkit-scrollbar {
      width: 4px;
    }
    .tutorial-panel::-webkit-scrollbar-track {
      background: rgba(0, 200, 255, 0.05);
      border-radius: 2px;
    }
    .tutorial-panel::-webkit-scrollbar-thumb {
      background: rgba(0, 200, 255, 0.3);
      border-radius: 2px;
    }
    .tutorial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 200, 255, 0.1);
      position: sticky;
      top: 0;
      background: rgba(10, 14, 26, 0.97);
      z-index: 1;
    }
    .tutorial-title {
      color: #00c8ff;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .close-btn {
      color: #4a6a8a;
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover {
      color: #ff6b6b;
    }
    .close-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }
    .tutorial-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tutorial-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(0, 200, 255, 0.03);
      border: 1px solid rgba(0, 200, 255, 0.05);
      transition: all 0.3s ease;
    }
    .tutorial-item:hover {
      background: rgba(0, 200, 255, 0.06);
      border-color: rgba(0, 200, 255, 0.1);
    }
    .tutorial-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-top: 1px;
      flex-shrink: 0;
    }
    .icon-gps { color: #00c8ff; }
    .icon-time { color: #4fc3f7; }
    .icon-home { color: #ffd740; }
    .icon-star { color: #ff6b35; }
    .icon-search { color: #69f0ae; }
    .icon-info { color: #ce93d8; }
    .icon-air { color: #80deea; }
    .icon-forecast { color: #ffab91; }
    .tutorial-item div {
      flex: 1;
    }
    .tutorial-item strong {
      color: #fff;
      font-size: 13px;
      display: block;
      margin-bottom: 2px;
    }
    .tutorial-item p {
      color: #4a6a8a;
      font-size: 12px;
      margin: 0;
      line-height: 1.4;
    }
    .highlight-text {
      color: #00c8ff;
      font-weight: 500;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @media (max-width: 768px) {
      .tutorial-container {
        top: 10px;
        right: 10px;
      }
      .tutorial-panel {
        right: 0;
        width: 290px;
        max-height: 400px;
        padding: 12px 14px;
      }
    }
  `]
})
export class TutorialComponent {
  showTutorial = true;
}