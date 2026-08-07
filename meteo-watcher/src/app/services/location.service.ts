import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private selectionModeSubject = new BehaviorSubject<boolean>(false);
  selectionMode$ = this.selectionModeSubject.asObservable();

  private selectedLocationSubject = new BehaviorSubject<any>(null);
  selectedLocation$ = this.selectedLocationSubject.asObservable();

  private favoritesSubject = new BehaviorSubject<any[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  private showSliderSubject = new BehaviorSubject<boolean>(false);
  showSlider$ = this.showSliderSubject.asObservable();

  private autoRotateSubject = new BehaviorSubject<boolean>(true);
  autoRotate$ = this.autoRotateSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  toggleSelectionMode() {
    this.selectionModeSubject.next(!this.selectionModeSubject.value);
  }

  setSelectionMode(mode: boolean) {
    this.selectionModeSubject.next(mode);
  }

  setLocation(coords: { lat: number; lng: number }, name?: string) {
    this.selectedLocationSubject.next({ ...coords, name: name || 'Ubicación seleccionada' });
    this.setSelectionMode(false);
  }

  resetView() {
    this.selectedLocationSubject.next(null);
    this.showSliderSubject.next(false);
  }

  getCurrentLocation(): any {
    return this.selectedLocationSubject.value;
  }

  toggleAutoRotate(enabled: boolean) {
    this.autoRotateSubject.next(enabled);
  }

  toggleFavorite(location: any) {
    const favorites = this.favoritesSubject.value;
    const index = favorites.findIndex(f => f.lat === location.lat && f.lng === location.lng);
    
    if (index === -1) {
      favorites.push({ ...location, id: Date.now() });
    } else {
      favorites.splice(index, 1);
    }
    
    this.favoritesSubject.next([...favorites]);
    this.saveFavorites();
  }

  removeFavorite(location: any) {
    const favorites = this.favoritesSubject.value;
    const index = favorites.findIndex(f => f.lat === location.lat && f.lng === location.lng);
    if (index !== -1) {
      favorites.splice(index, 1);
      this.favoritesSubject.next([...favorites]);
      this.saveFavorites();
    }
  }

  getFavorites(): any[] {
    return this.favoritesSubject.value;
  }

  toggleTimeSlider(show: boolean) {
    this.showSliderSubject.next(show);
  }

  private saveFavorites() {
    try {
      localStorage.setItem('favorites', JSON.stringify(this.favoritesSubject.value));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }

  private loadFavorites() {
    try {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        const favorites = JSON.parse(saved);
        this.favoritesSubject.next(favorites);
        setTimeout(() => {
          this.favoritesSubject.next([...favorites]);
        }, 100);
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }
}