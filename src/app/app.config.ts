import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideNgtRenderer } from 'angular-three/dom';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideNgtRenderer()],
};
