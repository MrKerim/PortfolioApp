import React, { useEffect } from "react";
import { useLoader, Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

import { Cache } from "three";

function Model({ url }) {
	const extension = url.split(".").pop().toLowerCase();

	const model = useLoader(
		extension === "glb" || extension === "gltf"
			? GLTFLoader
			: extension === "stl"
			? STLLoader
			: extension === "obj"
			? OBJLoader
			: null,
		url
	);

	useEffect(() => {
		return () => {
			Cache.clear(); // Clear cache on unmount
		};
	}, []);

	if (extension === "glb" || extension === "gltf") {
		return <primitive object={model.scene.clone(true)} />;
	} else if (extension === "stl") {
		// STLLoader returns geometry, wrap in mesh with material
		return (
			<mesh geometry={model}>
				<meshStandardMaterial color="gray" />
			</mesh>
		);
	} else if (extension === "obj") {
		// OBJLoader returns a group, clone it
		return <primitive object={model.clone(true)} />;
	}

	return null; // unsupported format fallback
}

export default function ModelViewer({ url }) {
	return (
		<div className="w-full h-full">
			<Canvas key={url}>
				<ambientLight />
				<directionalLight position={[2, 2, 2]} />
				<React.Suspense fallback={null}>
					<Model url={url} />
				</React.Suspense>
				<OrbitControls />
			</Canvas>
		</div>
	);
}
