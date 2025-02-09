import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
} from '@angular/core';
import { injectBeforeRender, NgtArgs } from 'angular-three';
import { Effect } from 'postprocessing';
import * as THREE from 'three';
import { Experience } from './experience';

// https://github.com/Domenicobrz/R3F-takes-flight/blob/main/src/MotionBlur.jsx
const fragmentShader = /* lang=glsl */ `
uniform float strength;

float rand2 (vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Fixed direction for left-to-right motion
    vec2 dir = vec2(-1.0, 0.0);
    
    vec4 accum = vec4(0.0);
    int samples = 8;
    
    for (int i = 0; i < samples; i++) {
        // Add some randomness to the sampling
        float offset = (float(i) / float(samples)) * strength;
        float random = rand2(uv * 5.0 + float(i));
        
        // Sample in the fixed direction
        vec2 offs = dir * offset * ((1.0 + random * 0.2) * 0.1);
        accum += texture2D(inputBuffer, uv + offs);
    }
    
    outputColor = accum / float(samples);
}`;

// Effect implementation
class MotionBlurImpl extends Effect {
  constructor() {
    super('MotionBlur', fragmentShader, {
      uniforms: new Map([['strength', new THREE.Uniform(0)]]),
    });
  }
}

@Component({
  selector: 'app-motion-blur',
  template: `
    <ngt-primitive *args="[effect()]" />
  `,
  imports: [NgtArgs],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotionBlur {
  private experience = inject(Experience);
  protected effect = computed(() => new MotionBlurImpl());

  constructor() {
    injectBeforeRender(() => {
      this.effect().uniforms.get('strength')!.value = this.experience.turbo;
    });

    inject(DestroyRef).onDestroy(() => {
      this.effect().dispose();
    });
  }
}
