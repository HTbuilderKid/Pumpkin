// The 3D body: a slowly turning see-through figure. Body systems that need attention glow in their status colour
// and get a marker over the rough area of the problem. Click a part or a marker to open it.
import * as THREE from "../vendor/three.module.js";

export const LEVEL_COLOR = ["#6f9bff", "#ffbe2e", "#ff7a1a", "#ff4558"];
const SKELETON = ["skull", "spine", "ribcage", "pelvis", "arms", "legs"];

const VERT = `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform vec3 uColor; uniform float uGain;
varying vec3 vN; varying vec3 vV;
void main() {                                   // x-ray look: edges glow, flat areas stay see-through
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  gl_FragColor = vec4(uColor, clamp((0.035 + 0.9 * rim) * uGain, 0.0, 1.0));
}`;

// canvas: where to draw      layer: an element over the canvas for the markers      catalog: for the body systems
// onPick(systemId): called when a part or a marker is clicked
export async function createBody(canvas, layer, catalog, onPick) {
  const [meta, bytes] = await Promise.all([
    fetch("assets/body.json").then(r => r.json()),
    fetch("assets/body.bin").then(r => { if (!r.ok) throw new Error("the body model did not download"); return r.arrayBuffer(); })]);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), figure = new THREE.Group();
  scene.add(figure);
  const camera = new THREE.PerspectiveCamera(26, 1, 10, 3000);
  const view = { dist: 430, y: 0 }, goal = { dist: 430, y: 0 };

  const systemOfMesh = {}, parts = {};
  for (const s of catalog.systems) for (const m of s.meshes) systemOfMesh[m] = s.id;
  for (const m of meta.meshes) {
    const q = new Uint16Array(bytes, m.offV, m.nv * 3), pos = new Float32Array(m.nv * 3);
    for (let i = 0; i < q.length; i++) pos[i] = m.min[i % 3] + q[i] / 65535 * m.size[i % 3];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes, m.offI, m.ni).slice(), 1));
    geo.computeVertexNormals();
    const base = m.name === "skin" ? { color: "#2f6bff", gain: 0.5 } : SKELETON.includes(m.name) ? { color: "#c8d8ff", gain: 0.34 } : { color: "#7fa8ff", gain: 0.5 };
    const mat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(base.color) }, uGain: { value: base.gain } }, vertexShader: VERT, fragmentShader: FRAG,
      side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = m.name === "skin" ? 0 : 1;
    figure.add(mesh);
    parts[m.name] = { mesh, base, centre: new THREE.Vector3().fromArray(m.centre), system: systemOfMesh[m.name] || null };
  }
  // where each body system's marker goes: the middle of an organ, or a named spot
  const spot = {};
  for (const s of catalog.systems) spot[s.id] = parts[s.spot] ? parts[s.spot].centre.clone() : new THREE.Vector3().fromArray(meta.spots[s.spot] || [0, 0, 0]);

  // ---- markers (drawn as page elements over the canvas, so they stay sharp and clickable) ----
  const markers = {};
  for (const s of catalog.systems) {
    const m = document.createElement("button");
    m.type = "button"; m.className = "marker"; m.hidden = true;
    const ring = document.createElement("i"), label = document.createElement("span");
    label.textContent = s.short; m.append(ring, label);
    m.addEventListener("click", () => onPick(s.id));
    layer.append(m); markers[s.id] = m;
  }

  let levels = {}, selected = null, spinning = !matchMedia("(prefers-reduced-motion: reduce)").matches, hover = false, drag = null, moved = 0;
  function paint(time) {
    const pulse = 0.78 + 0.22 * Math.sin(time / 260);
    for (const name in parts) {
      const p = parts[name], lv = p.system ? (levels[p.system] || 0) : 0, u = p.mesh.material.uniforms;
      const on = lv > 0, chosen = selected && p.system === selected;
      u.uColor.value.set(on ? LEVEL_COLOR[lv] : chosen ? "#ffffff" : p.base.color);
      u.uGain.value = on ? (name === "skin" ? 0.75 : 1.5) * pulse : chosen ? p.base.gain * 2.1 : p.base.gain * (selected && name !== "skin" ? 0.6 : 1);
    }
  }
  const v = new THREE.Vector3();
  function placeMarkers() {
    const w = canvas.clientWidth, h = canvas.clientHeight, shown = [];
    for (const id in markers) {
      const m = markers[id], lv = levels[id] || 0;
      m.hidden = lv === 0 && selected !== id;
      if (m.hidden) continue;
      v.copy(spot[id]).applyMatrix4(figure.matrixWorld).project(camera);
      shown.push({ id, m, lv, x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h });
    }
    // labels go to the right of their marker; when two markers sit at nearly the same height, the second one's goes left
    shown.sort((p, q) => p.y - q.y);
    let prev = null;
    for (const s of shown) {
      s.flip = s.x > w * 0.6 || (prev && Math.abs(s.y - prev.y) < 17 && !prev.flip && s.x > w * 0.3);
      s.m.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`;
      s.m.className = "marker lv" + s.lv + (selected === s.id ? " sel" : "") + (s.flip ? " flip" : "");
      prev = s;
    }
  }
  function resize() {
    const w = Math.max(2, canvas.clientWidth), h = Math.max(2, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();

  let stopped = false, frameId;
  let last = performance.now();
  (function frame(now) {
    if (stopped) return;
    frameId = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (spinning && !hover && !drag) figure.rotation.y += dt * 0.32;
    view.dist += (goal.dist - view.dist) * Math.min(1, dt * 4); view.y += (goal.y - view.y) * Math.min(1, dt * 4);
    // a narrow panel needs the camera further back to keep the whole figure in view
    const fit = Math.max(1, 0.62 / camera.aspect);
    camera.position.set(0, view.y, view.dist * (goal.dist > 400 ? fit : 1)); camera.lookAt(0, view.y, 0);
    figure.updateMatrixWorld();
    paint(now); renderer.render(scene, camera); placeMarkers();
  })(last);

  // ---- turning by hand, and clicking a part ----
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  canvas.addEventListener("pointerenter", () => { hover = true; });
  canvas.addEventListener("pointerleave", () => { hover = false; });
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX }; moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; drag.x = e.clientX; moved += Math.abs(dx); figure.rotation.y += dx * 0.012; });
  canvas.addEventListener("pointerup", e => {
    drag = null;
    if (moved > 4) return;                                   // that was a turn, not a click
    const r = canvas.getBoundingClientRect();
    ptr.set((e.clientX - r.left) / r.width * 2 - 1, 1 - (e.clientY - r.top) / r.height * 2);
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(Object.values(parts).filter(p => p.system).map(p => p.mesh));
    const owner = h => Object.values(parts).find(p => p.mesh === h.object).system;
    const organ = hits.find(h => owner(h) !== "core" && owner(h) !== "bone"), any = organ || hits.find(h => owner(h) !== "core") || hits[0];
    onPick(any ? owner(any) : null);
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault(); goal.dist = Math.max(220, Math.min(800, goal.dist + e.deltaY * 0.2));
  }, { passive: false });
  return {
    setSpinning(value) { spinning = value; },
    diagnostics() { return { meshes: Object.keys(parts).length, markers: Object.keys(markers).length,
      rotation: figure.rotation.y, distance: view.dist, cameraY: view.y,
      triangles: renderer.info.render.triangles, webglError: renderer.getContext().getError(),
      width: canvas.clientWidth, height: canvas.clientHeight }; },
    dispose() {
      stopped = true; cancelAnimationFrame(frameId); observer.disconnect();
      for (const p of Object.values(parts)) { p.mesh.geometry.dispose(); p.mesh.material.dispose(); }
      renderer.dispose(); layer.replaceChildren();
    },
    // levels: { systemId: 0..3 }
    setLevels(next) { levels = next; },
    // zoom in on one body system, or pass null for the whole figure
    select(systemId) {
      selected = systemId;
      if (systemId && spot[systemId]) { goal.y = spot[systemId].y * 0.45; goal.dist = systemId === "bone" || systemId === "muscle" || systemId === "core" ? 410 : 330; }
      else { goal.y = 0; goal.dist = 430; }
    },
  };
}
