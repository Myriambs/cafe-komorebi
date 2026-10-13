// Transformation en 3D : le héros tourne sur lui-même dans une spirale d'étoiles, l'uniforme apparaît
// à mi-tour, Moka reçoit sa tenue de concierge, puis plaque au nom du joueur et clin d'œil.
import * as THREE from 'three';
import { buildChar } from './chars3d.js';

const INK = '#3b2838';
function kit() {
  const grad = new THREE.DataTexture(new Uint8Array([110, 170, 225, 255]), 4, 1, THREE.RedFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const cache = new Map();
  const toon = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
  const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  const outline = (mesh, t) => {
    const g = mesh.geometry; g.computeBoundingBox();
    const s = new THREE.Vector3(), c = new THREE.Vector3(); g.boundingBox.getSize(s); g.boundingBox.getCenter(c);
    if (Math.min(s.x, s.y, s.z) < 1e-4) return;
    const sc = new THREE.Vector3((s.x + 2 * t) / s.x, (s.y + 2 * t) / s.y, (s.z + 2 * t) / s.z);
    const o = new THREE.Mesh(g, inkMat); o.scale.copy(sc); o.position.copy(c).multiply(new THREE.Vector3(1, 1, 1).sub(sc)); mesh.add(o);
  };
  return { THREE, toon, outline };
}
const varOf = (vars, k, d) => (vars.match(new RegExp(`--${k}:\\s*(#[0-9a-fA-F]{3,6})`)) || [])[1] || d;

/** Monte la scène 3D dans `host` et joue la séquence ; renvoie une promesse résolue à la fin. */
export function play3D(host, o, hooks) {
  const W = () => host.clientWidth, H = () => host.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W(), H());
  renderer.domElement.style.cssText = 'position:absolute;inset:0;z-index:2';
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, W() / H(), 0.1, 50);
  camera.position.set(0, 1.3, 7.2); camera.lookAt(0, 0.95, 0);
  scene.add(new THREE.HemisphereLight('#fff4e6', '#d9a7c0', 1.1));
  const sun = new THREE.DirectionalLight('#fff1d6', 1.6); sun.position.set(2, 4, 5); scene.add(sun);
  const k = kit();
  const hero = buildChar(o.hero === 'f' ? 'heroF' : 'heroM', { scale: 1.6 }, k);
  const cat = buildChar('moka', { scale: 1.45 }, k);
  hero.root.position.set(-0.15, 0, 0); cat.root.position.set(0.95, 0, 0.4); cat.root.rotation.y = -0.5;
  cat.setCostume(false);
  scene.add(hero.root, cat.root);
  const uni = { apron: varOf(o.vars, 'apron', '#74513f'), cap: varOf(o.vars, 'cap', varOf(o.vars, 'apron', '#74513f')), pants: varOf(o.vars, 'pants', '#5a4a50'), shirt: varOf(o.vars, 'shirt', '#f6e7cf') };

  // étoiles et poussière magique qui tournent en spirale autour du héros
  const starTex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(.3, '#fff3b8'); r.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(32, 2); g.lineTo(37, 27); g.lineTo(62, 32); g.lineTo(37, 37); g.lineTo(32, 62); g.lineTo(27, 37); g.lineTo(2, 32); g.lineTo(27, 27); g.closePath(); g.fill(); return c; })());
  const N = o.full ? 90 : 55, pos = new Float32Array(N * 3), seeds = Array.from({ length: N }, (_, i) => ({ a: i / N * Math.PI * 2 * 3, h: (i % 15) / 15, r: 0.55 + (i % 4) * 0.1, sp: 2.2 + (i % 5) * 0.35 }));
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: starTex, size: 0.16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  scene.add(pts);

  const clock = new THREE.Clock();
  let spin = null, lift = 0, done = false;
  const onResize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); };
  addEventListener('resize', onResize);
  renderer.setAnimationLoop(() => {
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    hero.update(t, dt); cat.update(t, dt);
    pts.material.opacity = Math.min(1, pts.material.opacity + dt * 1.5);
    for (let i = 0; i < N; i++) {
      const s = seeds[i], a = s.a + t * s.sp, h = (s.h + t * 0.28) % 1;
      pos[i * 3] = hero.root.position.x + Math.cos(a) * s.r * (1.1 - h * 0.4);
      pos[i * 3 + 1] = h * 2.3;
      pos[i * 3 + 2] = Math.sin(a) * s.r * (1.1 - h * 0.4);
    }
    geo.attributes.position.needsUpdate = true;
    if (spin) {
      spin.k = Math.min(1, spin.k + dt / spin.dur);
      const e = spin.k < .5 ? 2 * spin.k * spin.k : 1 - Math.pow(-2 * spin.k + 2, 2) / 2;
      hero.root.rotation.y = e * Math.PI * 2;
      cat.root.rotation.y = -0.5 + e * Math.PI * 2;
      if (!spin.swapped && e > 0.5) { spin.swapped = true; hero.setOutfit('uniform', uni); cat.setCostume(true); hooks.flash(); }
      if (spin.k >= 1) { const r = spin.resolve; spin = null; r(); }
    }
    hero.root.position.y += ((lift) - hero.root.position.y) * Math.min(1, dt * 6);
    renderer.render(scene, camera);
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const seq = (async () => {
    await wait(o.full ? 900 : 300);
    lift = 0.25;
    await new Promise(r => { spin = { k: 0, dur: o.full ? 1.6 : 1.0, swapped: false, resolve: r }; });
    lift = 0;
    await wait(o.full ? 600 : 250);
    hooks.plate();
    await wait(o.full ? 700 : 300);
    hero.wink(true); hooks.open();
    await wait(o.full ? 700 : 450);
    hero.wink(false);
    await wait(o.full ? 1300 : 600);
  })();
  return {
    done: seq,
    dispose() { if (done) return; done = true; renderer.setAnimationLoop(null); removeEventListener('resize', onResize); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
  };
}
