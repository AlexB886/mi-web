
import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const stage = document.getElementById("threeBattleStage");
const status = document.getElementById("threeBattleStatus");

if (stage && status) {
  const scene = new THREE.Scene();
  scene.background = null;

 
const camera = new THREE.PerspectiveCamera(
  38,
  stage.clientWidth / stage.clientHeight,
  0.1,
  100
);

function updateCamera() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;

  if (width < 500) {
    // Móvil
    camera.position.set(0, 3.1, 15);
    camera.fov = 43;
  } else if (width < 900) {
    // Tablet
    camera.position.set(0, 3, 12.5);
    camera.fov = 40;
  } else {
    // Ordenador y televisión
    camera.position.set(0, 2.8, 11);
    camera.fov = 38;
  }

  camera.lookAt(0, 1.3, 0);
  camera.updateProjectionMatrix();
}

updateCamera();


  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  stage.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x405060, 2));

  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  
/* El escenario de ruinas se mostrará como fondo CSS.
   El canvas 3D queda transparente para ver ese fondo. */


  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  const fighters = {};

  function loadFighter(name, url, x, facing) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          const wrapper = new THREE.Group();

          wrapper.add(model);
          wrapper.position.set(x, 0, 0);
          wrapper.rotation.y = facing;

          /* Centrar y ajustar el tamaño del modelo */
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z);

          if (!maxDimension) {
            reject(new Error(name + ": modelo vacío"));
            return;
          }

          model.position.sub(center);
          model.position.y += size.y / 2;
          const targetHeight = name === "dino" ? 2.35 : 2.35;
wrapper.scale.setScalar(targetHeight / size.y);

          scene.add(wrapper);

          const mixer = new THREE.AnimationMixer(model);
         
const clips = gltf.animations || [];
let idleAction = null;

console.log(name + " animaciones:", clips.map(c => c.name));

/* Buscar una animación de reposo, no caminar */
const idleClip = clips.find((clip) =>
  /idle|stand|standing|breath|rest|combat|fight.?idle/i.test(clip.name)
);

if (idleClip) {
  idleAction = mixer.clipAction(idleClip);
  idleAction.play();
  console.log(name + " idle activado:", idleClip.name);
} else {
  console.warn(
    name + ": no se encontró un idle. Se mostrará la pose estática."
  );
}


          fighters[name] = {
            wrapper,
            model,
            mixer,
            clips,
            idleAction,
            busy: false
          };

          resolve(fighters[name]);
        },
        undefined,
        (error) => {
          console.error("Error cargando " + name, error);
          reject(error);
        }
      );
    });
  }

  

async function initBattle() {
  try {
   await Promise.all([
  loadFighter(
    "dino",
    "models/trex-combate-real.glb",
    -2.1,
    Math.PI / 2
  ),
  loadFighter(
    "robot",
    "models/robot-combate.glb",
    2.1,
    -Math.PI / 2
  )
]);

    document.body.classList.add("battle-3d-loaded");
    status.textContent = "¡DINOSAURIO VS ROBOT!";
    console.log("Modelos 3D cargados correctamente");
  } catch (error) {
    status.textContent = "Error cargando modelos. Revisa la consola.";
    console.error(error);
  }
}


  
function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;

  if (!width || !height) return;

  updateCamera();
  renderer.setSize(width, height);
}


  window.addEventListener("resize", resize);

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    Object.values(fighters).forEach((fighter) => {
      fighter.mixer.update(delta);
    });

    renderer.render(scene, camera);
  }

  initBattle();
  animate();

  /* API para conectar los ataques más adelante */
  window.battle3D = {
    fighters,
   
playAttack(name, keywords) {
  const fighter = fighters[name];

  if (!fighter || fighter.busy) return false;

  let clip = null;

  if (name === "dino") {
    const requested = (keywords || []).join(" ").toLowerCase();

    if (requested.includes("tail")) {
      clip = fighter.clips.find(c => c.name === "attack_tail");
    } else if (requested.includes("fire") || requested.includes("bite")) {
      clip = fighter.clips.find(c => c.name === "bite");
    } else {
      clip = fighter.clips.find(c => c.name === "roar");
    }
  } else {
    clip = fighter.clips.find(c => c.name === "ArmatureArmatureAction");
  }

  if (!clip) {
    console.warn("No se encontró animación para", name, keywords);
    return false;
  }

  fighter.busy = true;

  const action = fighter.mixer.clipAction(clip);
  action.reset();
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();

  const onFinished = (event) => {
    if (event.action !== action) return;

    fighter.mixer.removeEventListener("finished", onFinished);
    fighter.busy = false;
  };

  fighter.mixer.addEventListener("finished", onFinished);

  return true;
}


  };
}
