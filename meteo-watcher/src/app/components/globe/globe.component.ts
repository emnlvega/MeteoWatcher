
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { LocationService } from '../../services/location.service';
import { WeatherService } from '../../services/weather.service';
import { GlobeControlsComponent } from '../globe-controls/globe-controls.component';
import { TimeSliderComponent } from '../time-slider/time-slider.component';
import { TutorialComponent } from '../tutorial/tutorial.component';

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    GlobeControlsComponent,
    TimeSliderComponent,
    TutorialComponent
  ],
  template: `
    <div #globeContainer class="globe-container">
      <app-tutorial></app-tutorial>
      <app-globe-controls></app-globe-controls>
      <app-time-slider 
        [class.hidden]="!showSlider" 
        (dayChanged)="onDayChanged($event)"
        (hourChanged)="onHourChanged($event)">
      </app-time-slider>
    </div>
  `,
  styles: [`
    .globe-container {
      width: 100%;
      height: 100%;
      position: relative;
      cursor: default;
    }
    .hidden {
      display: none !important;
    }
  `]
})
export class GlobeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeContainer') containerRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private labelRenderer!: CSS2DRenderer;
  private controls!: OrbitControls;
  private globe!: THREE.Mesh;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationId!: number;
  private isSelecting = false;
  private marker!: THREE.Mesh;
  private selectionRing!: THREE.Mesh;
  private favoritesMarkers: THREE.Mesh[] = [];
  showSlider = false;
  
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private hemisphereLight!: THREE.HemisphereLight;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.locationService.selectionMode$.subscribe(mode => {
      this.isSelecting = mode;
      if (mode && this.containerRef) {
        this.containerRef.nativeElement.style.cursor = 'crosshair';
      } else if (this.containerRef) {
        this.containerRef.nativeElement.style.cursor = 'default';
      }
    });

    this.locationService.selectedLocation$.subscribe(location => {
      if (location) {
        this.addMarker(location.lat, location.lng);
        this.rotateToLocation(location.lat, location.lng);
      }
    });

    this.locationService.favorites$.subscribe(favorites => {
      this.updateFavoritesMarkers(favorites);
    });

    this.locationService.showSlider$.subscribe(show => {
      this.showSlider = show;
    });

    setTimeout(() => {
      const favorites = this.locationService.getFavorites();
      if (favorites && favorites.length > 0) {
        this.updateFavoritesMarkers(favorites);
      }
    }, 800);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initScene();
      this.createGlobe();
      this.addStars();
      this.startAnimation();
      this.setupEventListeners();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.labelRenderer && this.labelRenderer.domElement) {
      const parent = this.labelRenderer.domElement.parentNode;
      if (parent) {
        parent.removeChild(this.labelRenderer.domElement);
      }
    }
  }

  private initScene() {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 3.5);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(width, height);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.labelRenderer.domElement.style.background = 'transparent';
    container.appendChild(this.labelRenderer.domElement);

     this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.08;
  this.controls.rotateSpeed = 0.5;
  this.controls.minDistance = 1.5;
  this.controls.maxDistance = 6;

  this.controls.autoRotate = true;
  this.controls.autoRotateSpeed = 0.5;
  this.controls.zoomSpeed = 0.5;
  this.controls.enableZoom = true;


  this.locationService.autoRotate$.subscribe(rotating => {
    if (this.controls) {
      this.controls.autoRotate = rotating;
    }
  });
}

  private createGlobe() {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  
  const textureLoader = new THREE.TextureLoader();
  





  
  const texture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  

  const cloudTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
  
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 5,
    specular: new THREE.Color(0x333333),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0
  });

  this.globe = new THREE.Mesh(geometry, material);
  this.scene.add(this.globe);



  this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3a3a3a, 0.6);
  this.scene.add(this.hemisphereLight);


  this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  this.sunLight.position.set(5, 3, 5);
  this.scene.add(this.sunLight);


  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
  fillLight.position.set(-5, -1, -5);
  this.scene.add(fillLight);


  const rimLight = new THREE.DirectionalLight(0x88ccff, 0.2);
  rimLight.position.set(0, 5, -5);
  this.scene.add(rimLight);

  const glowGeometry = new THREE.SphereGeometry(1.02, 64, 64);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  this.scene.add(glow);


  this.updateLighting(12);
}

  private addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 200;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  private getCoordinatesFromIntersect(intersect: THREE.Intersection): { lat: number; lng: number } {
    const p = intersect.point.clone().normalize();
    const lat = 90 - Math.acos(p.y) * 180 / Math.PI;
    let theta = Math.atan2(p.z, -p.x);
    let lng = theta * 180 / Math.PI - 180;
    if (lng < -180) lng += 360;
    if (lng > 180) lng -= 360;
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    };
  }

  private selectLocation(lat: number, lng: number) {
    this.locationService.setLocation({ lat, lng });
    this.weatherService.getWeatherByCoords(lat, lng);
  }

  private handleClick(event: MouseEvent) {
    if (!this.isSelecting) return;
    
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.globe);

    if (intersects.length > 0) {
      const { lat, lng } = this.getCoordinatesFromIntersect(intersects[0]);
      this.selectLocation(lat, lng);
    }
  }

  private setupEventListeners() {
    const container = this.containerRef.nativeElement;

    container.addEventListener('click', (event: MouseEvent) => {
      this.handleClick(event);
    });

    container.addEventListener('dblclick', (event: MouseEvent) => {
      if (!this.isSelecting) {
        this.locationService.setSelectionMode(true);
      }
      this.handleClick(event);
    });

    window.addEventListener('resize', () => {
      const container2 = this.containerRef.nativeElement;
      const width = container2.clientWidth;
      const height = container2.clientHeight;
      if (this.camera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
      if (this.renderer) {
        this.renderer.setSize(width, height);
      }
      if (this.labelRenderer) {
        this.labelRenderer.setSize(width, height);
      }
    });
  }

  private startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      if (this.controls) {
        this.controls.update();
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      if (this.labelRenderer && this.scene && this.camera) {
        this.labelRenderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  private addMarker(lat: number, lng: number) {
    if (this.marker) {
      this.scene.remove(this.marker);
      this.marker = null as any;
    }
    if (this.selectionRing) {
      this.scene.remove(this.selectionRing);
      this.selectionRing = null as any;
    }

    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    const radius = 1.01;
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00c8ff });
    this.marker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.marker.position.set(x, y, z);
    this.scene.add(this.marker);

    const ringGeometry = new THREE.RingGeometry(0.03, 0.06, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.selectionRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.selectionRing.position.set(x, y, z);
    this.selectionRing.lookAt(0, 0, 0);
    this.scene.add(this.selectionRing);

    this.animateRing();
  }

  private animateRing() {
    let scale = 1;
    let direction = 1;

    const pulse = () => {
      if (!this.selectionRing) return;
      
      scale += direction * 0.02;
      if (scale > 2.5 || scale < 0.5) direction *= -1;
      
      this.selectionRing.scale.set(scale, scale, scale);
      if (this.selectionRing.material) {
        (this.selectionRing.material as THREE.MeshBasicMaterial).opacity = 
          0.8 * (1 - (scale - 0.5) / 2);
      }
      
      requestAnimationFrame(pulse);
    };
    pulse();
  }

  private rotateToLocation(lat: number, lng: number) {
    if (!this.camera || !this.controls) return;
    
    const target = new THREE.Vector3();
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    
    target.x = -Math.sin(phi) * Math.cos(theta);
    target.y = Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);
    
    const direction = target.clone().normalize();
    const distance = this.camera.position.length();
    const newPosition = direction.multiplyScalar(distance);
    
    const startPosition = this.camera.position.clone();
    const duration = 1000;
    const startTime = Date.now();
    
    const animateRotation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      
      this.camera.position.lerpVectors(startPosition, newPosition, ease);
      this.camera.lookAt(0, 0, 0);
      this.controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      }
    };
    animateRotation();
  }

  private updateFavoritesMarkers(favorites: any[]) {
    if (this.favoritesMarkers && this.favoritesMarkers.length > 0) {
      this.favoritesMarkers.forEach(marker => {
        if (marker && this.scene) {
          this.scene.remove(marker);
        }
      });
    }
    this.favoritesMarkers = [];

    if (!favorites || favorites.length === 0 || !this.scene) {
      return;
    }

    favorites.forEach((fav) => {
      try {
        const phi = (90 - fav.lat) * Math.PI / 180;
        const theta = (fav.lng + 180) * Math.PI / 180;
        const radius = 1.01;
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        const markerGeometry = new THREE.SphereGeometry(0.018, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff6b35,
          transparent: true,
          opacity: 0.9
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        this.scene.add(marker);
        this.favoritesMarkers.push(marker);
      } catch (error) {
        console.error('Error creating favorite marker:', error);
      }
    });
  }

  private updateLighting(hour: number) {
  if (!this.sunLight) return;
  

  const normalizedHour = hour % 24;
  const sunAngle = ((normalizedHour / 24) * 2 * Math.PI);
  

  const sunHeight = Math.sin(sunAngle);
  

  const radius = 5;
  const sunX = Math.sin(sunAngle) * radius;
  const sunY = Math.max(0, Math.sin(sunAngle)) * radius;
  const sunZ = -Math.cos(sunAngle) * radius;
  
  this.sunLight.position.set(sunX, sunY, sunZ);
  

  this.sunLight.intensity = 1.5;
  this.sunLight.color.setHex(0xffffff);
  
  if (this.ambientLight) {
    this.ambientLight.intensity = 0.5;
    this.ambientLight.color.setHex(0x404060);
  }
}

  onDayChanged(event: { dt: number, data: any }) {
    if (!event || !event.dt) return;
    this.weatherService.setCurrentForecast(event.data);
  }

  onHourChanged(event: { hour: number }) {
    if (!event || event.hour === undefined) return;
    this.updateLighting(event.hour);
  }
}