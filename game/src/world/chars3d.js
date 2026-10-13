// Personnages 3D pour la rue (style toon du diorama) avec un vrai cycle de marche
// buildChar(kind, opts, kit) → { root, moving, update(t, dt) }
//   kind : 'heroF' | 'heroM' | 'moka' | 'biscuit'
//   kit  : { THREE, toon(color), outline(mesh, t) } fourni par l'extérieur

const SKIN = '#fde3d0', INK = '#3b2838';

export function buildChar(kind, opts, kit) {
  const { THREE, toon, outline } = kit;
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);

  // petit outil : ajoute un mesh avec contour et ombres
  function part(geo, color, parent, pos = [0, 0, 0], o = {}) {
    const m = new THREE.Mesh(geo, typeof color === 'string' ? toon(color) : color);
    m.position.set(...pos);
    if (o.scale) m.scale.set(...o.scale);
    if (o.rot) m.rotation.set(...o.rot);
    m.castShadow = o.cast !== false;
    if (o.outline !== false) outline(m, o.t ?? 0.012);
    parent.add(m);
    return m;
  }
  const S = (r, seg = 18) => new THREE.SphereGeometry(r, seg, Math.max(10, seg * 0.7 | 0));
  const Cy = (rt, rb, h, seg = 14) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const pivot = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const flat = (c) => new THREE.MeshBasicMaterial({ color: c });

  // yeux de dessin animé : pupille sombre + reflet
  function eye(parent, x, y, z, r = 0.032, iris = '#4a3346') {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    part(S(r, 12), flat(iris), g, [0, 0, 0], { scale: [0.85, 1.15, 0.45], outline: false, cast: false });
    part(S(r * 0.35, 8), flat('#ffffff'), g, [r * 0.3, r * 0.4, r * 0.35], { outline: false, cast: false });
    return g;
  }
  function blush(parent, x, y, z, r = 0.03) {
    part(S(r, 10), flat('#f6b0b5'), parent, [x, y, z], { scale: [1.2, 0.6, 0.3], outline: false, cast: false });
  }

  const ch = { root, moving: false, phase: 0, speed: 1, legs: [], arms: [], tail: null, head: null, kind, eyes: [], cityParts: [], uniParts: [], costume: [], mats: {} };
  if (opts.scale) root.scale.setScalar(opts.scale);

  if (kind === 'heroF' || kind === 'heroM') {
    const F = kind === 'heroF';
    const hair = F ? '#8a5242' : '#3f3548';
    const own = c => toon(c).clone();
    const top = own(F ? '#a8705a' : '#aea2cc'), jeans = own(F ? '#a3bcdc' : '#7686b2'), shoe = own('#fffaf2');
    ch.mats = { top, jeans, shoe, city: { top: top.color.clone(), jeans: jeans.color.clone(), shoe: shoe.color.clone() } };
    // jambes (pivot à la hanche)
    for (const s of [-1, 1]) {
      const hip = pivot(body, s * 0.065, 0.36, 0);
      part(F ? Cy(0.045, 0.07, 0.3) : Cy(0.048, 0.05, 0.3), jeans, hip, [0, -0.15, 0]);
      part(S(0.055, 12), shoe, hip, [0, -0.315, 0.025], { scale: [1, 0.6, 1.5] });
      ch.legs.push(hip);
    }
    // buste
    part(Cy(0.115, 0.14, 0.3, 16), top, body, [0, 0.5, 0]);
    part(S(0.118, 16), top, body, [0, 0.645, 0], { scale: [1, 0.45, 0.9], outline: false });
    if (!F) { // capuche et cordons
      ch.cityParts.push(part(new THREE.TorusGeometry(0.1, 0.035, 8, 18), '#9a8ebb', body, [0, 0.66, -0.02], { rot: [Math.PI / 2 - 0.3, 0, 0] }));
      for (const s of [-1, 1]) ch.cityParts.push(part(Cy(0.007, 0.007, 0.12, 6), '#fffaf2', body, [s * 0.035, 0.57, 0.12], { outline: false }));
    } else ch.cityParts.push(part(S(0.02, 8), '#f6e7cf', body, [0, 0.58, 0.125], { scale: [1, 1, 0.4] }));
    // uniforme : tablier, bretelles, broche dorée (couleurs changées par setOutfit)
    const apron = own('#74513f'); ch.mats.apron = apron;
    ch.uniParts.push(part(new THREE.BoxGeometry(0.2, 0.3, 0.02), apron, body, [0, 0.47, 0.135]));
    for (const s of [-1, 1]) ch.uniParts.push(part(new THREE.BoxGeometry(0.024, 0.06, 0.018), apron, body, [s * 0.065, 0.63, 0.122], { rot: [-0.3, 0, -s * 0.15], outline: false }));
    ch.uniParts.push(part(Cy(0.024, 0.024, 0.012, 14), '#e3c06e', body, [0.05, 0.56, 0.15], { rot: [Math.PI / 2, 0, 0], outline: false }));
    // bras (pivot à l'épaule)
    for (const s of [-1, 1]) {
      const sh = pivot(body, s * 0.15, 0.62, 0);
      sh.rotation.z = s * 0.12;
      part(Cy(0.038, 0.042, 0.24), top, sh, [0, -0.12, 0]);
      part(S(0.042, 10), SKIN, sh, [0, -0.26, 0]);
      ch.arms.push(sh);
    }
    // tête
    const head = pivot(body, 0, 0.88, 0); ch.head = head;
    part(S(0.23, 22), SKIN, head, [0, 0, 0], { scale: [1, 0.95, 0.95], t: 0.014 });
    part(S(0.245, 22), hair, head, [0, 0.045, -0.035], { scale: [1, 0.98, 0.98], t: 0.014 });
    part(S(0.2, 16), hair, head, [0, 0.12, 0.09], { scale: [1.05, 0.42, 0.75], outline: false }); // frange
    if (F) {
      part(S(0.2, 16), hair, head, [0, -0.2, -0.1], { scale: [1.3, 1.5, 0.75] }); // cheveux longs
      for (const s of [-1, 1]) part(S(0.07, 10), hair, head, [s * 0.2, -0.16, 0.04], { scale: [0.7, 1.9, 0.8] });
      // casque blanc
      ch.cityParts.push(part(new THREE.TorusGeometry(0.255, 0.022, 8, 28, Math.PI), '#f4f1ec', head, [0, 0.02, 0]));
      for (const s of [-1, 1]) ch.cityParts.push(part(Cy(0.075, 0.075, 0.06, 18), '#f4f1ec', head, [s * 0.255, 0.0, 0], { rot: [0, 0, Math.PI / 2] }));
    } else {
      for (const [x, z, r] of [[-0.1, 0.05, 0.6], [0.05, 0.08, -0.4], [0.14, -0.02, -0.8]]) part(new THREE.ConeGeometry(0.06, 0.14, 8), hair, head, [x, 0.25, z], { rot: [0.3, 0, r] });
      // lunettes rondes
      for (const s of [-1, 1]) part(new THREE.TorusGeometry(0.052, 0.008, 6, 20), flat(INK), head, [s * 0.075, -0.01, 0.222], { outline: false, cast: false });
      part(Cy(0.006, 0.006, 0.05, 6), flat(INK), head, [0, 0.0, 0.226], { rot: [0, 0, Math.PI / 2], outline: false, cast: false });
      // casque autour du cou
      ch.cityParts.push(part(new THREE.TorusGeometry(0.115, 0.018, 8, 22), '#2e2a33', body, [0, 0.69, 0.02], { rot: [Math.PI / 2 + 0.25, 0, 0] }));
      for (const s of [-1, 1]) ch.cityParts.push(part(Cy(0.05, 0.05, 0.04, 14), '#2e2a33', body, [s * 0.11, 0.68, 0.05], { rot: [0, 0, Math.PI / 2] }));
    }
    for (const s of [-1, 1]) { ch.eyes.push(eye(head, s * 0.075, -0.015, 0.2)); blush(head, s * 0.125, -0.07, 0.18); }
    // casquette de l'uniforme
    const cap = own('#74513f'); ch.mats.cap = cap;
    ch.uniParts.push(part(S(0.25, 20), cap, head, [0, 0.1, -0.02], { scale: [1.02, 0.55, 1.02] }));
    ch.uniParts.push(part(Cy(0.17, 0.17, 0.02, 20), cap, head, [0, 0.07, 0.19], { scale: [1, 1, 0.6] }));
    ch.uniParts.push(part(S(0.035, 10), '#e3c06e', head, [0, 0.2, 0.2], { scale: [1, 1, 0.4], outline: false }));
    part(S(0.012, 8), flat('#b85e66'), head, [0, -0.085, 0.215], { scale: [1.4, 0.8, 0.5], outline: false, cast: false });
    ch.speed = 9;
  }

  if (kind === 'moka' || kind === 'biscuit') {
    const cat = kind === 'moka';
    const fur = opts.fur ?? (cat ? '#a6abb7' : '#57545f'), white = '#f7f5f2';
    const L = cat ? 0.13 : 0.17, W = cat ? 0.075 : 0.09, legH = cat ? 0.17 : 0.22;
    // corps
    part(S(cat ? 0.17 : 0.21, 18), fur, body, [0, legH + 0.07, 0], { scale: cat ? [0.85, 0.8, 1.35] : [0.9, 0.85, 1.4], t: 0.012 });
    part(S(cat ? 0.12 : 0.15, 14), white, body, [0, legH + 0.03, 0.08], { scale: [0.8, 0.7, 1.1], outline: false });
    // pattes (paires diagonales)
    for (const [x, z] of [[-W, L], [W, L], [-W, -L], [W, -L]]) {
      const hip = pivot(body, x, legH + 0.02, z);
      part(Cy(cat ? 0.032 : 0.04, cat ? 0.03 : 0.038, legH, 10), cat ? white : white, hip, [0, -legH / 2, 0]);
      part(S(cat ? 0.036 : 0.045, 10), white, hip, [0, -legH, 0.012], { scale: [1, 0.6, 1.3] });
      ch.legs.push(hip);
    }
    // tête
    const head = pivot(body, 0, legH + (cat ? 0.25 : 0.3), cat ? 0.2 : 0.27); ch.head = head;
    const hr = cat ? 0.145 : 0.165;
    part(S(hr, 20), fur, head, [0, 0, 0], { scale: [1.08, 0.95, 0.95], t: 0.012 });
    part(S(hr * 0.62, 14), white, head, [0, -0.05, hr * 0.6], { scale: cat ? [1.3, 0.85, 0.8] : [1.4, 0.9, 1.1], outline: false });
    if (!cat) part(S(hr * 0.5, 12), white, head, [0, 0.03, hr * 0.62], { scale: [0.6, 1.2, 0.6], outline: false }); // masque du husky
    for (const s of [-1, 1]) {
      part(new THREE.ConeGeometry(hr * 0.42, hr * (cat ? 0.75 : 1.0), 4), fur, head, [s * hr * 0.6, hr * 0.85, -0.01], { rot: [0, Math.PI / 4, -s * 0.28] });
      eye(head, s * hr * 0.42, 0.01, hr * 0.85, cat ? 0.026 : 0.027, cat ? '#4a3346' : '#4a6a8a');
      blush(head, s * hr * 0.62, -0.05, hr * 0.72, 0.022);
    }
    part(S(0.018, 8), flat(cat ? '#f39aa6' : INK), head, [0, -0.03, hr * 1.02], { scale: [1.3, 0.9, 0.8], outline: false, cast: false });
    // queue (segments qui ondulent)
    const tail = pivot(body, 0, legH + 0.12, cat ? -0.24 : -0.3); ch.tail = tail;
    let seg = tail;
    for (let i = 0; i < 4; i++) {
      const g = pivot(seg, 0, i ? 0.07 : 0, 0);
      g.rotation.x = cat ? -0.35 : -0.6;
      part(S(cat ? 0.035 : 0.05, 10), i === 3 ? white : fur, g, [0, 0.035, 0], { scale: [1, 1.4, 1], outline: i === 3 });
      seg = g;
    }
    if (cat && !opts.plain) {
      const before = new Set(body.children.concat(head.children));
      // tenue de concierge : veste violette, boutons dorés, casquette à visière avec patte dorée
      const coat = '#5d5a8f';
      part(S(0.16, 16), coat, body, [0, legH + 0.08, 0.06], { scale: [0.9, 0.82, 0.95] });
      for (const [x, y] of [[-0.035, 0.03], [0.035, 0.03], [-0.035, -0.02], [0.035, -0.02]]) part(S(0.013, 8), '#e3c06e', body, [x, legH + 0.08 + y, 0.21], { outline: false });
      part(new THREE.TorusGeometry(0.07, 0.016, 6, 16), '#f7f5f2', body, [0, legH + 0.18, 0.15], { rot: [Math.PI / 2 - 0.5, 0, 0] }); // col
      const cap = pivot(head, 0, hr * 0.78, 0.01); cap.rotation.x = -0.12;
      part(Cy(0.1, 0.09, 0.07, 18), coat, cap, [0, 0.03, 0]);
      part(Cy(0.11, 0.11, 0.015, 18), '#46447a', cap, [0, 0.07, 0]);
      part(Cy(0.07, 0.07, 0.012, 16, 1), '#2e2a40', cap, [0, -0.005, 0.07], { scale: [1, 1, 0.7] });
      part(S(0.022, 10), '#e3c06e', cap, [0, 0.035, 0.095], { scale: [1, 1, 0.4], outline: false });
      for (const c of body.children.concat(head.children)) if (!before.has(c)) ch.costume.push(c);
    } else if (!cat) {
      // collier : corde (perdu) ou bandana rouge (adopté), médaille dorée
      if (opts.adopted) {
        part(new THREE.ConeGeometry(0.11, 0.12, 3), '#e86a5f', body, [0, legH + 0.13, 0.27], { rot: [Math.PI, 0, 0], scale: [1, 1, 0.4] });
      } else {
        part(new THREE.TorusGeometry(0.11, 0.014, 6, 18), '#b59a74', body, [0, legH + 0.2, 0.22], { rot: [Math.PI / 2 - 0.6, 0, 0] });
      }
      if (opts.named || opts.adopted) part(S(0.02, 8), '#e3c06e', body, [0, legH + 0.1, 0.31], { scale: [1.4, 1, 0.4], outline: false });
    }
    ch.speed = cat ? 12 : 11;
  }

  /** Tenue du héros : 'city' ou 'uniform' (couleurs : apron, cap, pants, shirt). */
  ch.setOutfit = (mode, col = {}) => {
    const uni = mode === 'uniform';
    for (const m of ch.cityParts) m.visible = !uni;
    for (const m of ch.uniParts) m.visible = uni;
    if (!ch.mats.top) return;
    if (uni) {
      ch.mats.top.color.set(col.shirt ?? '#f6e7cf'); ch.mats.jeans.color.set(col.pants ?? '#5a4a50'); ch.mats.shoe.color.set('#2a2630');
      ch.mats.apron.color.set(col.apron ?? '#74513f'); ch.mats.cap.color.set(col.cap ?? col.apron ?? '#74513f');
    } else { ch.mats.top.color.copy(ch.mats.city.top); ch.mats.jeans.color.copy(ch.mats.city.jeans); ch.mats.shoe.color.copy(ch.mats.city.shoe); }
  };
  ch.setCostume = on => { for (const m of ch.costume) m.visible = on; };
  ch.wink = on => { if (ch.eyes[1]) ch.eyes[1].scale.y = on ? 0.15 : 1; };
  if (ch.uniParts.length) ch.setOutfit('city');

  // posture de sommeil pour le chien : couché, tête basse
  ch.sleeping = false;
  ch.update = (t, dt) => {
    const k = ch.moving ? 1 : 0;
    ch.amp = (ch.amp ?? 0) + (k - (ch.amp ?? 0)) * Math.min(1, dt * 8);
    if (ch.moving) ch.phase += dt * ch.speed;
    const a = ch.amp, s = Math.sin(ch.phase);
    if (kind === 'heroF' || kind === 'heroM') {
      ch.legs[0].rotation.x = s * 0.65 * a; ch.legs[1].rotation.x = -s * 0.65 * a;
      ch.arms[0].rotation.x = -s * 0.55 * a; ch.arms[1].rotation.x = s * 0.55 * a;
      body.position.y = Math.abs(Math.cos(ch.phase)) * 0.035 * a + Math.sin(t * 2) * 0.006 * (1 - a);
      body.rotation.y = s * 0.06 * a;
      ch.head.rotation.z = Math.sin(t * 1.3) * 0.04 * (1 - a);
    } else {
      // pattes en diagonale : avant gauche + arrière droite, puis l'inverse
      const sw = 0.6 * a;
      ch.legs[0].rotation.x = s * sw; ch.legs[3].rotation.x = s * sw;
      ch.legs[1].rotation.x = -s * sw; ch.legs[2].rotation.x = -s * sw;
      body.position.y = Math.abs(Math.cos(ch.phase)) * 0.02 * a;
      if (ch.sleeping) { body.position.y = -0.08; body.rotation.x = 0.05; ch.head.rotation.x = 0.35; }
      ch.tail.rotation.y = Math.sin(t * (ch.moving ? 9 : kind === 'biscuit' && !ch.sleeping ? 7 : 2.5)) * (ch.sleeping ? 0.1 : 0.5);
      ch.head.rotation.y = Math.sin(t * 0.9) * 0.15 * (1 - a);
    }
  };
  return ch;
}
