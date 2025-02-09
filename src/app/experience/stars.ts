import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, viewChildren } from '@angular/core';
import { injectTexture } from 'angular-three-soba/loaders';
import { NgtsInstance, NgtsInstances } from 'angular-three-soba/performances';
import * as THREE from 'three';

import { injectBeforeRender, NgtArgs } from 'angular-three';
import { Experience } from './experience';
import starPng from './star.png' with { loader: 'file' };

const colors = ['#fcaa67', '#c75d59', '#ffffc7', '#8cc5c6', '#a5898c'];

@Component({
  selector: 'app-stars',
  template: `
    <ngts-instances [options]="{ limit: count, range: count }">
      <ngt-plane-geometry *args="[1, 0.05]" />
      <ngt-mesh-basic-material [side]="DoubleSide" [alphaMap]="texture()" transparent />

      @for (s of stars; track $index) {
        <ngts-instance
          [options]="{ position: s.position, scale: [s.length, 1, 1], color: s.color, userData: { speed: s.speed } }"
        />
      }
    </ngts-instances>
  `,
  imports: [NgtArgs, NgtsInstances, NgtsInstance],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stars {
  protected readonly DoubleSide = THREE.DoubleSide;
  protected readonly count = 350;

  protected readonly stars = Array.from({ length: this.count }, () => this.randomizeStar());

  private instances = viewChildren(NgtsInstance);

  private experience = inject(Experience);
  protected texture = injectTexture(() => starPng);

  constructor() {
    injectBeforeRender(({ delta }) => {
      for (const instance of this.instances()) {
        const {
          position: iPosition,
          scale: iScale,
          color: iColor,
          userData,
        } = instance.positionMeshRef().nativeElement;

        iPosition.x += userData['speed'] * delta + 1 * this.experience.turbo;

        if (iPosition.x > 40) {
          const { position, length, speed, color } = this.randomizeStar();

          iPosition.copy(position);
          iScale.setX(length);
          iColor.copy(color);
          userData['speed'] = speed;
        }
      }
    });
  }

  private randomizeStar() {
    const position = new THREE.Vector3();
    let length: number;

    if (this.random(0, 1) > 0.8) {
      position.set(this.random(-10, -30), this.random(-5, 5), this.random(6, -6));
      length = this.random(1.5, 15);
    } else {
      position.set(this.random(-15, -45), this.random(-10.5, 1.5), this.random(30, -45));
      length = this.random(2.5, 20);
    }

    const speed = this.random(19.5, 42);
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])
      .convertSRGBToLinear()
      .multiplyScalar(1.3);

    return { position, length, speed, color };
  }

  private random(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
