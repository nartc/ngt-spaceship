import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, viewChild } from '@angular/core';
import { extend, injectBeforeRender, injectStore, is, NgtArgs, NgtThreeEvent } from 'angular-three';
import { NgtpBloom, NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtsPerspectiveCamera } from 'angular-three-soba/cameras';
import { NgtsEnvironment } from 'angular-three-soba/staging';
import * as THREE from 'three';
import { Spaceship } from './spaceship';
import { Stars } from './stars';

@Component({
  selector: 'app-experience',
  template: `
    <ngts-perspective-camera [options]="{ makeDefault: true, position: [-5, 6, 10], fov: 25 }" />

    <app-spaceship />
    <app-stars />

    <ngt-mesh #plane [renderOrder]="2" [visible]="false" (pointermove)="onPointerMove($event)">
      <ngt-plane-geometry *args="[20, 20]" />
      <ngt-mesh-basic-material transparent [opacity]="0.25" [color]="[1, 0, 1]" />
    </ngt-mesh>

    <ngts-environment [options]="{ preset: 'city' }" />

    <ngtp-effect-composer>
      <ngtp-bloom [options]="{ kernelSize: 3, luminanceThreshold: 0, luminanceSmoothing: 0.9, intensity: 1.5 }" />
    </ngtp-effect-composer>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgtsPerspectiveCamera, NgtsEnvironment, NgtpEffectComposer, NgtpBloom, NgtArgs, Spaceship, Stars],
})
export class Experience {
  private spaceship = viewChild.required(Spaceship);

  private translateAcceleration = 0;
  private translateY = 0;
  private angleAcceleration = 0;
  private angleZ = 0;

  private intersectionPoint = new THREE.Vector3();

  constructor() {
    extend(THREE);

    const store = injectStore();
    const pmrem = new THREE.PMREMGenerator(store.snapshot.gl);

    let envMap: THREE.WebGLRenderTarget;

    injectBeforeRender(({ scene }) => {
      const spaceshipModel = this.spaceship().modelRef()?.nativeElement;
      if (!spaceshipModel) {
        scene.background = new THREE.Color(0x598889).multiplyScalar(0.05);
        return;
      }

      this.translateAcceleration += (this.intersectionPoint.y - this.translateY) * 0.002;
      this.translateAcceleration *= 0.95;
      this.translateY += this.translateAcceleration;

      const dir = this.intersectionPoint
        .clone()
        .sub(new THREE.Vector3(0, this.translateY, 0))
        .normalize();
      const dirCos = dir.dot(new THREE.Vector3(0, 1, 0));
      const angle = Math.acos(dirCos) - Math.PI * 0.5;

      this.angleAcceleration += (angle - this.angleZ) * 0.01;
      this.angleAcceleration *= 0.85;
      this.angleZ += this.angleAcceleration;

      spaceshipModel.position.setY(this.translateY);
      spaceshipModel.rotation.set(this.angleZ, 0, this.angleZ, 'ZXY');

      if (envMap) envMap.dispose();

      // setup env map
      spaceshipModel.visible = false;
      scene.background = null;
      envMap = pmrem.fromScene(scene);
      scene.background = new THREE.Color(0x598889).multiplyScalar(0.05);
      spaceshipModel.visible = true;

      spaceshipModel.traverse((child) => {
        if (
          is.three<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(child, 'isMesh') &&
          child.material.envMapIntensity
        ) {
          child.material.envMap = envMap.texture;
          child.material.envMapIntensity = 100;
          child.material.normalScale.set(0.3, 0.3);
        }
      });
    });
  }

  protected onPointerMove(event: NgtThreeEvent<PointerEvent>) {
    this.intersectionPoint.set(-3, event.point.y, event.point.z);
  }
}
