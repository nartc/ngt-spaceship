import { Component } from '@angular/core';
import { NgtCanvas, NgtCanvasContent } from 'angular-three/dom';
import { Experience } from './experience/experience';

@Component({
  selector: 'app-root',
  template: `
    <ngt-canvas>
      <app-experience *canvasContent />
    </ngt-canvas>
    <code class="absolute top-4 left-4 text-white">Move mouse to move ship; Hold to turbo</code>
  `,
  host: { class: 'block relative h-dvh w-full' },
  imports: [NgtCanvas, NgtCanvasContent, Experience],
})
export class AppComponent {}
