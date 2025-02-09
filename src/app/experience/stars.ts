import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, viewChildren } from '@angular/core';
import { injectTexture } from 'angular-three-soba/loaders';
import { NgtsInstance, NgtsInstances } from 'angular-three-soba/performances';
import * as THREE from 'three';

import { injectBeforeRender, NgtArgs } from 'angular-three';
import starPng from './star.png' with { loader: 'file' };

const colors = ['#fcaa67', '#c75d59', '#ffffc7', '#8cc5c6', '#a5898c'];

@Component({
  selector: 'app-stars',
  template: `
    <ngts-instances [options]="{ limit: count, range: count }">
      <ngt-plane-geometry *args="[1, 0.05]" />
      <ngt-mesh-basic-material [side]="DoubleSide" [alphaMap]="texture()" transparent />

      @for (star of stars; track $index) {
        <ngts-instance
          [options]="{
            position: star.position,
            scale: [star.length, 1, 1],
            color: star.color,
            userData: { speed: star.speed },
          }"
        />
      }
    </ngts-instances>

    <ngt-mesh [position.y]="2"></ngt-mesh>
  `,
  imports: [NgtArgs, NgtsInstances, NgtsInstance],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stars {
  protected readonly DoubleSide = THREE.DoubleSide;
  protected readonly count = 300;

  protected readonly stars = Array.from({ length: this.count }, () => this.randomizeStar());

  private instances = viewChildren(NgtsInstance);

  protected texture = injectTexture(() => starPng);

  constructor() {
    injectBeforeRender(({ delta }) => {
      for (const instance of this.instances()) {
        const positionMesh = instance.positionMeshRef().nativeElement;
        positionMesh.position.x += positionMesh.userData['speed'] * delta;
        if (positionMesh.position.x > 40) {
          const { position, length, speed, color } = this.randomizeStar();

          positionMesh.position.copy(position);
          positionMesh.scale.setX(length);
          positionMesh.color.copy(color);
          positionMesh.userData['speed'] = speed;
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
