import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import chairUrl from '../assets/office_chair.glb'; // Corrected filename

function AvatarOnChair({ avatarUrl, chairUrl }) {
  const { scene: avatarScene } = useGLTF(avatarUrl);
  const { scene: chairScene } = useGLTF(chairUrl);

  useEffect(() => {
    if (!avatarScene) return;

    // Adjust avatar position to sit on the chair
    avatarScene.position.set(0, -1.6, 0);

    // Rotate bones manually to create a sitting pose
    const leftUpLeg = avatarScene.getObjectByName('LeftUpLeg');
    const rightUpLeg = avatarScene.getObjectByName('RightUpLeg');
    if (leftUpLeg) leftUpLeg.rotation.x = -Math.PI / 3;
    if (rightUpLeg) rightUpLeg.rotation.x = -Math.PI / 3;

    const leftLeg = avatarScene.getObjectByName('LeftLeg');
    const rightLeg = avatarScene.getObjectByName('RightLeg');
    if (leftLeg) leftLeg.rotation.x = Math.PI / 4;
    if (rightLeg) rightLeg.rotation.x = Math.PI / 4;

    // Optional: adjust arms to rest on lap
    const leftArm = avatarScene.getObjectByName('LeftArm');
    const rightArm = avatarScene.getObjectByName('RightArm');
    if (leftArm) leftArm.rotation.z = Math.PI / 12;
    if (rightArm) rightArm.rotation.z = -Math.PI / 12;

  }, [avatarScene]);

  return (
    <>
      <primitive object={chairScene} scale={1.5} position={[0, -1.6, 0]} />
      <primitive object={avatarScene} />
    </>
  );
}

export default function Avatar({ modelUrl }) {
  return (
    <Canvas camera={{ position: [0, 1.4, 2.5], fov: 45 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        <AvatarOnChair
          avatarUrl={modelUrl}
          chairUrl={chairUrl}
        />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} target={[0, 1.2, 0]} />
    </Canvas>
  );
}
