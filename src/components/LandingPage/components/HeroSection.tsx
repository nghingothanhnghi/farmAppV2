import React, { Suspense, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, Sky, GradientTexture, PerspectiveCamera } from '@react-three/drei';
import { useSpring} from '@react-spring/three';
import * as THREE from 'three';
import { Link } from 'react-router';
import { useWebGLSupport } from '../../../hooks/useWebGLSupport';
import { useTheme } from "../../../hooks/useTheme";
import { Popover } from '../../common/Popover';

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
    { id: 2, title: 'Water Tank', desc: 'Stores nutrient-rich water for circulation.', position: [4, 0, 1] },
    { id: 3, title: 'Water Pump', desc: 'Pumps water to keep the system flowing.', position: [3.5, 0, 1] },
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
    const controlsRef = useRef<any>(null);
    // Keep track of last camera state
    const lastPos = useRef<[number, number, number]>([0, 3, 15]);
    const lastLook = useRef<[number, number, number]>([0, 0, 0]);

    // One persistent spring
    const [{ camPos, camLook }, api] = useSpring(() => ({
        camPos: lastPos.current,
        camLook: lastLook.current,
        config: { tension: 80, friction: 20 },
    }));

    React.useEffect(() => {
        const nextPos: [number, number, number] = target
            ? [target[0], target[1] + 2, target[2] + 5]
            : [0, 3, 15];

        const nextLook: [number, number, number] = target || [0, 0, 0];

        // ✅ Explicitly pass `from` as a plain object with correct tuple types
        api.start({
            from: { camPos: [...lastPos.current], camLook: [...lastLook.current] },
            to: { camPos: nextPos, camLook: nextLook },
            onChange: (result) => {
                // Safely update refs as camera animates
                const pos = result.value.camPos as [number, number, number];
                const look = result.value.camLook as [number, number, number];
                lastPos.current = pos;
                lastLook.current = look;
            },
        });
    }, [target, api]);

    useFrame(() => {
        if (!camRef.current || !controlsRef.current) return;

        camPos.to((x, y, z) => camRef.current!.position.set(x, y, z));
        camLook.to((x, y, z) => {
            controlsRef.current!.target.set(x, y, z);
            controlsRef.current!.update();
            camRef.current!.lookAt(x, y, z);
        });
    });

    return (
        <>
            <PerspectiveCamera ref={camRef} makeDefault fov={40} />
            <OrbitControls
                ref={controlsRef}
                minDistance={5}
                maxDistance={25}
                enableDamping
                dampingFactor={0.08}
            />
        </>
    );
}


// --- Hero Section ---
const HeroSection: React.FC = () => {
    const { isDark } = useTheme(); // ✅ reads from localStorage + system

    const { color1, color2, color3 } = useSpring({
        color1: isDark ? "#0a0a0a" : "#cfe8ff",
        color2: isDark ? "#141414" : "#e9f4ff",
        color3: isDark ? "#1a1a1a" : "#ffffff",
        config: { mass: 1, tension: 200, friction: 26 }, // smooth spring
    });

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
                    {isDark ? (
                        <color attach="background" args={["#0a0a0a"]} />
                    ) : (
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
                    )}
                    <mesh position={[0, 6, -50]} scale={[120, 70, 1]}>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial toneMapped={false}>
                            <GradientTexture
                                stops={[0, 0.55, 1]}
                                colors={[color1.get(), color2.get(), color3.get()]} // animated colors
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
                </Canvas>


                {active && (
                    <Popover
                        open={!!active}
                        anchorX={window.innerWidth / 2} // center horizontally
                        anchorY={window.innerHeight - 80} // 80px from bottom
                        placement="top"
                        onClose={() => setActive(null)}
                    >
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
                    </Popover>

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
