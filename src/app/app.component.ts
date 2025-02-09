import { Component } from '@angular/core';
import { NgtCanvas, NgtCanvasContent } from 'angular-three/dom';
import { Experience } from './experience/experience';

@Component({
  selector: 'app-root',
  template: `
    <ngt-canvas>
      <app-experience *canvasContent />
    </ngt-canvas>
  `,
  host: { class: 'block h-dvh w-full' },
  imports: [NgtCanvas, NgtCanvasContent, Experience],
})
export class AppComponent {}
