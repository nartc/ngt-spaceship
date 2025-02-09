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
    vec2 aspectCorrection = vec2(1.0, aspect);

    vec2 dir = normalize(uv - vec2(0.5));
    float dist = length(uv - vec2(0.5));
    float positionalStrength = max(dist - 0.1, 0.0) * 0.1;
    positionalStrength = pow(positionalStrength, 1.5) * 7.0;

    vec4 accum = vec4(0.0);
    for (int i = 0; i < 8; i++) {
        vec2 offs1 = -dir * positionalStrength * strength * ((float(i) + rand2(uv * 5.0)) * 0.2);
        vec2 offs2 = dir * positionalStrength * strength * ((float(i) + rand2(uv * 5.0)) * 0.2);

        accum += texture2D(inputBuffer, uv + offs1);
        accum += texture2D(inputBuffer, uv + offs2);
    }
    accum *= 1.0 / 14.0;

    outputColor = accum;
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
