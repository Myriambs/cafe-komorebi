import type * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export interface Char3D { root: THREE.Group; moving: boolean; sleeping: boolean; dispose(): void }
export interface Exterior {
  scene: THREE.Scene; camera: THREE.PerspectiveCamera; controls: OrbitControls; y0: number;
  addSprite(svg: string, o?: { x?: number; y?: number; z?: number; h?: number; aspect?: number }): THREE.Sprite;
  setSpriteSvg(sp: THREE.Sprite, svg: string): void;
  removeSprite(sp: THREE.Sprite): void;
  walk(sp: THREE.Sprite, pts: [number, number, number][], speed?: number): Promise<void>;
  focus(target: [number, number, number], dist: number, duration?: number): Promise<void>;
  onZoomIn(threshold: number, cb: () => void): () => void;
  dispose(): void;
  fitDist(): number;
  addChar(kind: 'heroF' | 'heroM' | 'moka' | 'biscuit', o?: { x?: number; z?: number; ry?: number; named?: boolean; adopted?: boolean; sleeping?: boolean }): Char3D;
  walkChar(ch: Char3D, pts: [number, number, number][], speed?: number): Promise<void>;
  faceTo(ch: Char3D, ry: number): void;
  /** Déplace le personnage avec les flèches (relatives à la caméra) ; renvoie la fonction d'arrêt. */
  driveChar(ch: Char3D, keys: { up: boolean; down: boolean; left: boolean; right: boolean }, speed?: number): () => void;
  onPick(cb: (name: string) => void): void;
}
export function createExterior(container: HTMLElement, mode?: 'morning' | 'sunset' | 'night', opts?: { autoRotate?: boolean }): Exterior;
