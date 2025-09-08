import React, { Suspense, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame} from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, Sky, GradientTexture, PerspectiveCamera } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { Link } from 'react-router';
import { useWebGLSupport } from '../../../hooks/useWebGLSupport';

// --- Types ---
type AnnotationData = {
    id: number;
    title: string;
    desc: string;
    position: [number, number, number];
};

type AnnotationProps = {
    data: AnnotationData;
    onClick: (a: AnnotationData) => void;
};

// --- Annotations ---
const ANNOTATIONS: AnnotationData[] = [
    { id: 1, title: 'Pingping', desc: 'Main reservoir where water is distributed.', position: [2, 3, 0] },
    { id: 2, title: 'Water Tank', desc: 'Stores nutrient-rich water for circulation.', position: [5, 0, 0] },
    { id: 3, title: 'Water Pump', desc: 'Pumps water to keep the system flowing.', position: [1, 1, 2] },
    { id: 4, title: 'Interconnected Pingping', desc: 'Connects all pipes together.', position: [4, 0, -2] },
    { id: 5, title: 'Plants', desc: 'Hydroponic plants growing with nutrient water.', position: [0, 4, 1] },
    { id: 6, title: 'Outlet Pipe', desc: 'Excess water exits through this pipe.', position: [-2, 0, -3] },
];

// --- HydroFarm Model ---
function HydroFarmModel(props: any) {
    const { scene } = useGLTF('/3d/hydroponic_farming_setup.glb');
    const model = useMemo(() => scene.clone(), [scene]);

    useMemo(() => {
        if (!model) return;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.setScalar(scale);
    }, [model]);

    return <primitive object={model} {...props} />;
}

// --- Annotation marker ---
function Annotation({ data, onClick }: AnnotationProps) {


    return (
        <mesh position={data.position}>
            <Html distanceFactor={12}>
                <div
                    onClick={() => onClick(data)} // click triggers zoom
                    className="cursor-pointer rounded bg-white/80 px-2 py-1 text-xs shadow text-center font-bold"
                >
                    {data.id} {/* only display number */}
                </div>
            </Html>
        </mesh>
    );
}


function CameraController({ target }: { target?: [number, number, number] }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null); // simplest



  const { camPos, camLook } = useSpring({
    camPos: target ? [target[0], target[1] + 2, target[2] + 5] : [0, 3, 15],
    camLook: target || [0, 0, 0],
    config: { tension: 80, friction: 20 },
  });

  useFrame(() => {
    if (!camRef.current || !controlsRef.current) return;

    // Animate camera position
    camPos.to((x: number, y: number, z: number) => {
      camRef.current!.position.set(x, y, z);
    });

    // Animate controls target and lookAt
    camLook.to((x: number, y: number, z: number) => {
      controlsRef.current!.target.set(x, y, z);
      controlsRef.current!.update();
      camRef.current!.lookAt(x, y, z);
    });
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault fov={40} />
      <OrbitControls ref={controlsRef} minDistance={5} maxDistance={25} />
    </>
  );
}


// --- Hero Section ---
const HeroSection: React.FC = () => {
    const [active, setActive] = useState<AnnotationData | null>(null);
    const supported = useWebGLSupport();
    if (!supported) {
        return (
            <section className="flex h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">
                        ⚠️ WebGL not supported
                    </h2>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Please enable WebGL in your browser or switch to Chrome for the 3D experience.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative isolate overflow-hidden h-screen">
            <div className="absolute inset-0 z-0">
                    <Canvas gl={{ powerPreference: "high-performance", preserveDrawingBuffer: true }} camera={{ position: [0, 3, 15], fov: 40 }}>
                        <fog attach="fog" args={['#e6f3ff', 30, 120]} />
                        <Sky
                            distance={450000}
                            sunPosition={[20, 15, -10]}
                            turbidity={6}
                            rayleigh={2}
                            mieCoefficient={0.005}
                            mieDirectionalG={0.8}
                            inclination={0.49}
                            azimuth={0.25}
                        />
                        <mesh position={[0, 6, -50]} scale={[120, 70, 1]}>
                            <planeGeometry args={[1, 1]} />
                            <meshBasicMaterial toneMapped={false}>
                                <GradientTexture
                                    stops={[0, 0.55, 1]}
                                    colors={['#cfe8ff', '#e9f4ff', '#ffffff']}
                                    size={1024}
                                />
                            </meshBasicMaterial>
                        </mesh>

                        <ambientLight intensity={0.6} />
                        <directionalLight position={[10, 15, -5]} intensity={1.2} />

                        <Suspense fallback={null}>
                            <HydroFarmModel position={[5, 0, 0]} />
                        </Suspense>

                        {ANNOTATIONS.map((a) => (
                            <Annotation key={a.id} data={a} onClick={setActive} />
                        ))}

                        <CameraController target={active?.position} />
                        {/* <OrbitControls minDistance={5} maxDistance={25} autoRotate autoRotateSpeed={0.2} /> */}
                    </Canvas>


                {active && (
                    <div className="absolute bottom-10 left-1/2 z-20 w-80 -translate-x-1/2 rounded-xl bg-white p-4 shadow-lg ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {active.title}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{active.desc}</p>
                        <button
                            onClick={() => setActive(null)}
                            className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
                        >
                            Close
                        </button>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/70 via-transparent to-white/90 dark:from-zinc-900/70 dark:via-transparent dark:to-zinc-950/90" />
            </div>

            <div className="relative z-20 mx-auto max-w-7xl px-6 py-24 lg:py-32 pointer-events-none">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                        Smart Hydroponic Farming
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                        Automate nutrients, monitor water quality, and optimize growth with real-time analytics and 3D system control.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Link to="/hydroponic-system" className="pointer-events-auto rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500">
                            Open Dashboard
                        </Link>
                        <a href="#features" className="pointer-events-auto text-sm font-semibold leading-6 text-zinc-900 dark:text-white">
                            Learn more →
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
