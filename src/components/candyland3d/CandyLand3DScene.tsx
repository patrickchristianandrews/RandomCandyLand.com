import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BoardTile3D, ChaosPlayer } from '../../types/candyChaos';

interface CandyLand3DSceneProps {
  tiles: BoardTile3D[];
  players: ChaosPlayer[];
  activePlayerId: string;
  onTileClick?: (tileIndex: number) => void;
  cannonFiring?: { fromTile: number; toTile: number } | null;
  zoomLevel?: number;
}

export const CandyLand3DScene: React.FC<CandyLand3DSceneProps> = ({
  tiles,
  players,
  activePlayerId,
  onTileClick,
  cannonFiring,
  zoomLevel = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const reqIdRef = useRef<number>(0);
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  // Mouse drag camera orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 45 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9b6e8); // Sky Blue
    scene.fog = new THREE.FogExp2(0xf9b6e8, 0.009);
    sceneRef.current = scene;

    // 2. CAMERA
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 30, 42);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth > 700, alpha: false, powerPreference:'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.2 : 1.5));
    renderer.shadowMap.enabled = window.innerWidth > 700;
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

    // Candy forest: lightweight instanced sculpted lollipop towers, designed
    // to create genuine depth without loading large 3D models on phones.
    const candyStem = new THREE.CylinderGeometry(.17,.23,7,8);
    const candyHead = new THREE.SphereGeometry(1.2,12,9);
    const candyStripe = new THREE.TorusGeometry(.85,.13,5,16);
    const stemMaterial = new THREE.MeshStandardMaterial({color:0xfff4dd,roughness:.5});
    const candyColors = [0xff5f9d,0xffdc66,0x9c6afa,0x5ee5e3];
    const candyMats = candyColors.map(color=>new THREE.MeshStandardMaterial({color,roughness:.24,metalness:.08}));
    const forest = new THREE.Group();
    const temp = new THREE.Object3D();
    const count=28;
    const stems = new THREE.InstancedMesh(candyStem,stemMaterial,count);
    const heads = candyMats.map(mat=>new THREE.InstancedMesh(candyHead,mat,count/4));
    const stripeMat = new THREE.MeshStandardMaterial({color:0xffffff,roughness:.3});
    const stripes = new THREE.InstancedMesh(candyStripe,stripeMat,count);
    for(let i=0;i<count;i++){
      const angle=i*2.39996,radius=29+(i%5)*4;
      const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
      const size=.7+(i%4)*.13;
      temp.position.set(x,2.3,z);temp.rotation.set(0,angle,0);temp.scale.set(size,size,size);temp.updateMatrix();stems.setMatrixAt(i,temp.matrix);
      temp.position.set(x,6.2*size,z);temp.scale.set(size,size,size);temp.updateMatrix();heads[i%4].setMatrixAt(Math.floor(i/4),temp.matrix);
      temp.position.set(x,6.2*size,z+0.23);temp.rotation.set(.3,angle,0);temp.updateMatrix();stripes.setMatrixAt(i,temp.matrix);
    }
    forest.add(stems,...heads,stripes);
    scene.add(forest);

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
    const clock = new THREE.Clock();
    let lastFrame = 0;
    let destroyed = false;
    const animate = (now: number) => {
      if (destroyed) return;
      reqIdRef.current = requestAnimationFrame(animate);
      if (document.visibilityState === 'hidden' || now - lastFrame < 32) return;
      lastFrame = now;
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation on particles
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = elapsed * 0.04;
      }

      // Update camera position based on orbit angles
      const { theta, phi } = cameraAngleRef.current;
      const radius = Math.max(18, Math.min(85, cameraAngleRef.current.radius + zoomRef.current * 4));
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = Math.max(8, radius * Math.cos(phi));
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 4, 0);

      // Animate Player Pawns (idle bobbing)
      playerMeshesRef.current.forEach((mesh, id) => {
        const offset = id.charCodeAt(0) % 5;
        const target = mesh.userData.target as THREE.Vector3 | undefined;
        if (target) mesh.position.lerp(target, 0.065);
        mesh.rotation.y = Math.sin(elapsed*0.7+offset)*0.14;
        if(mesh.children[0])mesh.children[0].rotation.z=Math.sin(elapsed*2.5+offset)*0.07;
      });

      renderer.render(scene, camera);
    };
    reqIdRef.current = requestAnimationFrame(animate);

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
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(20, Math.min(80, cameraAngleRef.current.radius + e.deltaY * 0.05));
    };
    let lastTouchDistance=0;
    const onTouchStart=(e:TouchEvent)=>{if(e.touches.length===2){lastTouchDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}else if(e.touches.length===1){isDraggingRef.current=true;prevMouseRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}};
    const onTouchMove=(e:TouchEvent)=>{if(e.touches.length===2){const distance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);cameraAngleRef.current.radius=Math.max(20,Math.min(80,cameraAngleRef.current.radius-(distance-lastTouchDistance)*0.11));lastTouchDistance=distance;e.preventDefault();}else if(e.touches.length===1&&isDraggingRef.current){const p=e.touches[0],diffX=p.clientX-prevMouseRef.current.x,diffY=p.clientY-prevMouseRef.current.y;cameraAngleRef.current.theta-=diffX*0.009;cameraAngleRef.current.phi=Math.max(.2,Math.min(Math.PI/2.2,cameraAngleRef.current.phi-diffY*.008));prevMouseRef.current={x:p.clientX,y:p.clientY};e.preventDefault();}};
    const onTouchEnd=()=>{isDraggingRef.current=false;lastTouchDistance=0;};

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart',onTouchStart,{passive:true});
    container.addEventListener('touchmove',onTouchMove,{passive:false});
    container.addEventListener('touchend',onTouchEnd);

    return () => {
      destroyed = true;
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart',onTouchStart);
      container.removeEventListener('touchmove',onTouchMove);
      container.removeEventListener('touchend',onTouchEnd);
      scene.traverse(object => {const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(m=>m.dispose());}});
      playerMeshesRef.current.clear();
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


        // Colorful sculpted accessories: recognizable stage personas without
        // heavy downloaded models or photographs.
        const color = (hex: number) => new THREE.MeshStandardMaterial({color:hex,roughness:.3,metalness:.13});
        const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, rotZ=0) => {
          const part = new THREE.Mesh(geometry,material);
          part.position.set(x,y,z);part.rotation.z=rotZ;pawnGroup.add(part);return part;
        };
        const star=player.characterId;
        if(star==='taylor'||star==='sabrina'||star==='beyonce'||star==='gaga'||star==='billie'){
          const hairHue=star==='billie'?0x222a24:star==='beyonce'?0x8e4d20:star==='gaga'?0xd9e9f2:0xe7bc66;
          add(new THREE.SphereGeometry(.65,12,10),color(hairHue),0,2.4,-.23);
          add(new THREE.BoxGeometry(.98,.11,.15),color(0xffffff),0,1.65,.55);
          if(star==='gaga')add(new THREE.ConeGeometry(.36,.9,9),color(0xfac6ff),0,3.11,0);
          if(star==='beyonce')add(new THREE.TorusGeometry(.45,.1,6,16),color(0xffd34a),0,3.16,0);
          if(star==='taylor')add(new THREE.BoxGeometry(.13,.83,.12),color(0xefa3d1),-.52,1.3,.27,-.28);
        }
        if(star==='bunny'){add(new THREE.ConeGeometry(.17,.82,10),color(0xf8d5eb),-.27,3.07,0);add(new THREE.ConeGeometry(.17,.82,10),color(0xf8d5eb),.27,3.07,0);add(new THREE.TorusGeometry(.56,.12,6,16),color(0x55de9a),0,1.5,0);}
        if(star==='lebron'){add(new THREE.SphereGeometry(.53,12,10),color(0x552a1e),0,2.48,-.14);add(new THREE.SphereGeometry(.28,12,10),color(0xe46d2a),.7,1.3,.4);}
        if(star==='bruno'){add(new THREE.CylinderGeometry(.58,.6,.25,16),color(0xedd0aa),0,2.95,0);add(new THREE.CylinderGeometry(.4,.4,.48,16),color(0x382a2b),0,3.15,0);}
        if(star==='peppermint'){add(new THREE.ConeGeometry(.55,.72,10),color(0xffffff),0,2.95,0);}
        if(star==='donut'){add(new THREE.TorusGeometry(.56,.19,10,18),color(0xf57ec0),0,2.95,0);}
        if(star==='skittle'||star==='gummy'){add(new THREE.ConeGeometry(.47,.63,10),color(0xb6f25d),0,2.9,0);}
        // Tiny eyes and cheeks give everybody visible character.
        add(new THREE.SphereGeometry(.07,7,6),color(0x241224),-.21,2.21,.48);
        add(new THREE.SphereGeometry(.07,7,6),color(0x241224),.21,2.21,.48);
        add(new THREE.SphereGeometry(.09,7,6),color(0xf1a4ad),-.37,2.04,.45);
        add(new THREE.SphereGeometry(.09,7,6),color(0xf1a4ad),.37,2.04,.45);
        scene.add(pawnGroup);
        playerMeshesRef.current.set(player.id, pawnGroup);
      }

      // Smoothly reposition pawn to target tile
      const targetPos = new THREE.Vector3(tile.x, tile.y + 0.4, tile.z);
      pawnGroup.userData.target = targetPos;
      if (pawnGroup.position.lengthSq() < 0.01) pawnGroup.position.copy(targetPos);
    });
  }, [players, tiles]);

  return (
    <div className="relative w-full h-[380px] sm:h-[560px] rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-200 bg-pink-200">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      
      {/* 3D Camera Orbit Helper Hint */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-mono text-[10px] pointer-events-none flex items-center gap-1.5 shadow">
        <span>🖱️ Drag to rotate 3D board</span>
        <span>&bull;</span>
        <span>Pinch, scroll or use +/- to zoom</span>
      </div>
    </div>
  );
};
