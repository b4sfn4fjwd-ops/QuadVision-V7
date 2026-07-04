/* ============================================================================
   threefx.js — Advanced Interactive Math Matrix
   Morphing particles with Plexus (line connections) and Raycast Mouse Repulsion.
   ============================================================================ */
window.ThreeFx = (function () {
  'use strict';

  const REDUCE = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scene, camera, renderer, particles, linesMesh;
  let raf;
  const NUM_PARTICLES = 700; // Reduced for Plexus performance
  const MAX_LINES = 1500;
  
  const shapes = {
    sphere: new Float32Array(NUM_PARTICLES * 3),
    cube: new Float32Array(NUM_PARTICLES * 3),
    helix: new Float32Array(NUM_PARTICLES * 3),
    torus: new Float32Array(NUM_PARTICLES * 3)
  };

  // Base positions before mouse repulsion
  const basePositions = new Float32Array(NUM_PARTICLES * 3);
  // Current actual positions (affected by mouse)
  const currentPositions = new Float32Array(NUM_PARTICLES * 3);
  // Velocities for spring physics
  const velocities = new Float32Array(NUM_PARTICLES * 3);

  let currentShape = 'sphere';
  let nextShape = 'cube';
  let morphProgress = 0;
  const MORPH_SPEED = 0.005;
  const IDLE_TIME = 200; 
  let idleCounter = 0;
  
  // Interaction
  let mouse = new THREE.Vector2(-9999, -9999);
  let raycaster = new THREE.Raycaster();
  let interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let mousePoint = new THREE.Vector3();

  function init() {
    if (!window.THREE) return;
    const container = document.getElementById('three-container');
    if (!container) return;

    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 140;

    // Generate Shape Data
    generateSphere();
    generateCube();
    generateHelix();
    generateTorus();

    // Setup Particles
    const pGeometry = new THREE.BufferGeometry();
    pGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    const colorLavender = new THREE.Color(0x7a5cf0);
    const colorPink = new THREE.Color(0xe0609a);
    const pColors = new Float32Array(NUM_PARTICLES * 3);
    
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const color = Math.random() > 0.4 ? colorLavender : colorPink;
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
    }
    pGeometry.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    // Setup Plexus Lines
    const lGeometry = new THREE.BufferGeometry();
    const lPositions = new Float32Array(MAX_LINES * 2 * 3);
    const lColors = new Float32Array(MAX_LINES * 2 * 3);
    
    lGeometry.setAttribute('position', new THREE.BufferAttribute(lPositions, 3));
    lGeometry.setAttribute('color', new THREE.BufferAttribute(lColors, 3));
    
    const lMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    linesMesh = new THREE.LineSegments(lGeometry, lMaterial);
    scene.add(linesMesh);

    // Events
    function resize() {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();
    
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; }, false);

    if (!REDUCE()) {
      animate();
    } else {
      renderer.render(scene, camera);
    }
  }
  
  function onMouseMove(event) {
    const container = document.getElementById('three-container');
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // ---- Shape Generators ----
  function generateSphere() {
    const radius = 40;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const phi = Math.acos(-1 + (2 * i) / NUM_PARTICLES);
      const theta = Math.sqrt(NUM_PARTICLES * Math.PI) * phi;
      shapes.sphere[i*3] = radius * Math.cos(theta) * Math.sin(phi);
      shapes.sphere[i*3+1] = radius * Math.sin(theta) * Math.sin(phi);
      shapes.sphere[i*3+2] = radius * Math.cos(phi);
    }
  }

  function generateCube() {
    const size = 55;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      shapes.cube[i*3] = (Math.random() - 0.5) * size;
      shapes.cube[i*3+1] = (Math.random() - 0.5) * size;
      shapes.cube[i*3+2] = (Math.random() - 0.5) * size;
    }
  }

  function generateHelix() {
    const radius = 25;
    const height = 90;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const t = i / NUM_PARTICLES;
      const angle = t * Math.PI * 16; 
      const offset = (i % 2 === 0) ? Math.PI : 0; 
      const scatterR = radius + (Math.random() - 0.5) * 6;
      shapes.helix[i*3] = scatterR * Math.cos(angle + offset);
      shapes.helix[i*3+1] = (t - 0.5) * height;
      shapes.helix[i*3+2] = scatterR * Math.sin(angle + offset);
    }
  }

  function generateTorus() {
    const r1 = 30;
    const r2 = 12;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const r2s = r2 + (Math.random() - 0.5) * 5;
      shapes.torus[i*3] = (r1 + r2s * Math.cos(v)) * Math.cos(u);
      shapes.torus[i*3+1] = r2s * Math.sin(v);
      shapes.torus[i*3+2] = (r1 + r2s * Math.cos(v)) * Math.sin(u);
    }
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    
    // 1. Raycast Mouse to 3D Plane
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(interactionPlane, mousePoint);
    
    // Rotate entire group slowly
    particles.rotation.y += 0.0015;
    particles.rotation.x += 0.0005;
    linesMesh.rotation.y = particles.rotation.y;
    linesMesh.rotation.x = particles.rotation.x;

    // 2. Morphing Base Positions
    if (morphProgress < 1) {
      morphProgress += MORPH_SPEED;
      if (morphProgress > 1) morphProgress = 1;
    } else {
      idleCounter++;
      if (idleCounter > IDLE_TIME) {
        idleCounter = 0;
        morphProgress = 0;
        currentShape = nextShape;
        const order = ['sphere', 'cube', 'helix', 'torus'];
        nextShape = order[(order.indexOf(currentShape) + 1) % order.length];
      }
    }

    const ease = morphProgress < 0.5 
      ? 4 * Math.pow(morphProgress, 3) 
      : 1 - Math.pow(-2 * morphProgress + 2, 3) / 2;
      
    const currArr = shapes[currentShape];
    const nextArr = shapes[nextShape];
    
    for (let i = 0; i < NUM_PARTICLES * 3; i++) {
      basePositions[i] = currArr[i] + (nextArr[i] - currArr[i]) * ease;
    }

    // 3. Physics (Mouse Repulsion + Spring back to base)
    // We need to un-rotate the mouse point into local space, but it's easier to rotate particles to world space
    // For simplicity, we approximate repulsion in local space by applying inverse rotation to mousePoint
    const localMouse = mousePoint.clone().applyAxisAngle(new THREE.Vector3(1,0,0), -particles.rotation.x)
                                         .applyAxisAngle(new THREE.Vector3(0,1,0), -particles.rotation.y);

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const idx = i * 3;
      
      const bx = basePositions[idx];
      const by = basePositions[idx+1];
      const bz = basePositions[idx+2];
      
      let cx = currentPositions[idx];
      let cy = currentPositions[idx+1];
      let cz = currentPositions[idx+2];
      
      // Repulsion
      const dx = cx - localMouse.x;
      const dy = cy - localMouse.y;
      const dz = cz - localMouse.z;
      const distSq = dx*dx + dy*dy + dz*dz;
      
      if (distSq < 1500 && mouse.x !== -9999) { // ~38 units radius
        const force = (1500 - distSq) * 0.0003;
        velocities[idx] += dx * force;
        velocities[idx+1] += dy * force;
        velocities[idx+2] += dz * force;
      }
      
      // Spring back to base position
      velocities[idx] += (bx - cx) * 0.08;
      velocities[idx+1] += (by - cy) * 0.08;
      velocities[idx+2] += (bz - cz) * 0.08;
      
      // Damping
      velocities[idx] *= 0.75;
      velocities[idx+1] *= 0.75;
      velocities[idx+2] *= 0.75;
      
      currentPositions[idx] += velocities[idx];
      currentPositions[idx+1] += velocities[idx+1];
      currentPositions[idx+2] += velocities[idx+2];
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // 4. Update Plexus Lines
    const lPos = linesMesh.geometry.attributes.position.array;
    const lCol = linesMesh.geometry.attributes.color.array;
    const pCol = particles.geometry.attributes.color.array;
    
    let lineCount = 0;
    
    // O(N^2) check - acceptable for 700 particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
      for (let j = i + 1; j < NUM_PARTICLES; j++) {
        if (lineCount >= MAX_LINES) break;
        
        const dx = currentPositions[i*3] - currentPositions[j*3];
        const dy = currentPositions[i*3+1] - currentPositions[j*3+1];
        const dz = currentPositions[i*3+2] - currentPositions[j*3+2];
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq < 400) { // Connect if distance < 20
          const alpha = 1.0 - (distSq / 400);
          
          // Line start
          lPos[lineCount*6] = currentPositions[i*3];
          lPos[lineCount*6+1] = currentPositions[i*3+1];
          lPos[lineCount*6+2] = currentPositions[i*3+2];
          
          lCol[lineCount*6] = pCol[i*3] * alpha;
          lCol[lineCount*6+1] = pCol[i*3+1] * alpha;
          lCol[lineCount*6+2] = pCol[i*3+2] * alpha;
          
          // Line end
          lPos[lineCount*6+3] = currentPositions[j*3];
          lPos[lineCount*6+4] = currentPositions[j*3+1];
          lPos[lineCount*6+5] = currentPositions[j*3+2];
          
          lCol[lineCount*6+3] = pCol[j*3] * alpha;
          lCol[lineCount*6+4] = pCol[j*3+1] * alpha;
          lCol[lineCount*6+5] = pCol[j*3+2] * alpha;
          
          lineCount++;
        }
      }
    }
    
    linesMesh.geometry.setDrawRange(0, lineCount * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  return { init: init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.ThreeFx.init);
} else {
  window.ThreeFx.init();
}
