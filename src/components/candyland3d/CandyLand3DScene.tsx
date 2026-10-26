import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BoardTile3D, ChaosPlayer } from '../../types/candyChaos';

interface CandyLand3DSceneProps {
  tiles: BoardTile3D[];
  players: ChaosPlayer[];
  activePlayerId: string;
  onTileClick?: (tileIndex: number) => void;
  cannonFiring?: { fromTile: number; toTile: number } | null;
}

export const CandyLand3DScene: React.FC<CandyLand3DSceneProps> = ({
  tiles,
  players,
  activePlayerId,
  onTileClick,
  cannonFiring,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const reqIdRef = useRef<number>(0);

  // Mouse drag camera orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 45 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc); // Sky Blue
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.012);
    sceneRef.current = scene;

    // 2. CAMERA
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 30, 42);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(30, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const pinkRim = new THREE.DirectionalLight(0xf472b6, 0.6);
    pinkRim.position.set(-30, 20, -30);
    scene.add(pinkRim);

    // 5. MARSHMALLOW FLUFFY GROUND
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xfdf2f8,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. 3D CANDY TILES & TRACK
    const tilesGroup = new THREE.Group();
    tilesGroupRef.current = tilesGroup;

    tiles.forEach((tile) => {
      // Tile Base Cylinder (Candy Gumdrop Disc)
      const tileGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.6, 24);
      const tileMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(tile.color),
        roughness: 0.25,
        metalness: 0.15,
      });
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(tile.x, tile.y, tile.z);
      tileMesh.castShadow = true;
      tileMesh.receiveShadow = true;
      tileMesh.userData = { tileIndex: tile.index };
      tilesGroup.add(tileMesh);

      // Sugar Rim
      const rimGeo = new THREE.TorusGeometry(1.45, 0.15, 8, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.set(tile.x, tile.y + 0.3, tile.z);
      tilesGroup.add(rimMesh);

      // Landmarks & Special Props
      if (tile.landmark === 'CANDY_CASTLE') {
        // Grand Castle at the end of the track
        const castleGroup = new THREE.Group();
        castleGroup.position.set(tile.x, tile.y + 0.5, tile.z);

        // Center Keep
        const keepGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 16);
        const keepMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
        const keep = new THREE.Mesh(keepGeo, keepMat);
        keep.position.y = 3;
        castleGroup.add(keep);

        // Conical Roof
        const roofGeo = new THREE.ConeGeometry(3.2, 4, 16);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 8;
        castleGroup.add(roof);

        // Gold Victory Crown
        const crownGeo = new THREE.TorusGeometry(0.8, 0.25, 8, 16);
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = 10.5;
        castleGroup.add(crown);

        tilesGroup.add(castleGroup);
      } else if (tile.landmark === 'PEPPERMINT_MINEFIELD') {
        // Striped Peppermint Candy
        const mintGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 16);
        const mintMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const mint = new THREE.Mesh(mintGeo, mintMat);
        mint.position.set(tile.x, tile.y + 1, tile.z);
        mint.rotation.z = Math.PI / 2;
        tilesGroup.add(mint);
      } else if (tile.landmark === 'DONUT_VOLCANO') {
        // Sprinkled Donut
        const donutGeo = new THREE.TorusGeometry(1.5, 0.7, 16, 24);
        const donutMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
        const donut = new THREE.Mesh(donutGeo, donutMat);
        donut.rotation.x = Math.PI / 2;
        donut.position.set(tile.x, tile.y + 0.8, tile.z);
        tilesGroup.add(donut);
      }
    });

    scene.add(tilesGroup);

    // 7. FLOATING SUGAR SPARKLES (Particles)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 80;
      particlePos[i + 1] = Math.random() * 30;
      particlePos[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particleSystemRef.current = particles;

    // 8. ANIMATION LOOP
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation on particles
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = elapsed * 0.04;
      }

      // Update camera position based on orbit angles
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = Math.max(8, radius * Math.cos(phi));
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 4, 0);

      // Animate Player Pawns (idle bobbing)
      playerMeshesRef.current.forEach((mesh, id) => {
        const offset = id.charCodeAt(0) % 5;
        mesh.position.y += Math.sin(elapsed * 4 + offset) * 0.006;
      });

      renderer.render(scene, camera);
    };
    animate();

    // 9. RESIZE LISTENER
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. MOUSE DRAG ORBIT CONTROLS
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi - deltaY * 0.008));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraAngleRef.current.radius = Math.max(20, Math.min(80, cameraAngleRef.current.radius + e.deltaY * 0.05));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [tiles]);

  // UPDATE PLAYER 3D PAWNS WHEN PLAYERS OR POSITIONS CHANGE
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    players.forEach((player) => {
      const tile = tiles[Math.min(tiles.length - 1, player.tileIndex)];
      if (!tile) return;

      let pawnGroup = playerMeshesRef.current.get(player.id);
      if (!pawnGroup) {
        // Create 3D Pawn
        pawnGroup = new THREE.Group();

        // 1. Pawn Body
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.8, 1.8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: player.characterId === 'trumpagotchi' ? 0x1e3a8a :
                 player.characterId === 'marshmallow' ? 0xffffff :
                 player.characterId === 'peppermint' ? 0xef4444 :
                 player.characterId === 'gummy' ? 0x22c55e :
                 player.characterId === 'donut' ? 0xec4899 : 0xa855f7,
          roughness: 0.3,
          metalness: 0.2,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        pawnGroup.add(body);

        // 2. Pawn Head
        const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({
          color: player.characterId === 'trumpagotchi' ? 0xfcd3a7 :
                 player.characterId === 'marshmallow' ? 0xffffff : 0xfde047,
          roughness: 0.4,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.1;
        head.castShadow = true;
        pawnGroup.add(head);

        // 3. Iconic Trump Golden Comb-Over Mesh
        if (player.characterId === 'trumpagotchi') {
          const hairGeo = new THREE.ConeGeometry(0.65, 0.6, 12);
          const hairMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.3 });
          const hair = new THREE.Mesh(hairGeo, hairMat);
          hair.rotation.z = -0.4;
          hair.position.set(0.1, 2.5, 0);
          pawnGroup.add(hair);

          // Red Tie
          const tieGeo = new THREE.BoxGeometry(0.15, 0.9, 0.08);
          const tieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
          const tie = new THREE.Mesh(tieGeo, tieMat);
          tie.position.set(0, 1.2, 0.45);
          pawnGroup.add(tie);
        } else if (player.characterId === 'marshmallow') {
          // Top hat for Sir Reginald
          const hatGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 12);
          const hatMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
          const hat = new THREE.Mesh(hatGeo, hatMat);
          hat.position.y = 2.7;
          pawnGroup.add(hat);
        }

        scene.add(pawnGroup);
        playerMeshesRef.current.set(player.id, pawnGroup);
      }

      // Smoothly reposition pawn to target tile
      const targetPos = new THREE.Vector3(tile.x, tile.y + 0.4, tile.z);
      pawnGroup.position.lerp(targetPos, 0.3);
    });
  }, [players, tiles]);

  return (
    <div className="relative w-full h-[400px] sm:h-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400 bg-sky-300">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D Camera Orbit Helper Hint */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-mono text-[10px] pointer-events-none flex items-center gap-1.5 shadow">
        <span>🖱️ Drag to rotate 3D board</span>
        <span>&bull;</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
};
