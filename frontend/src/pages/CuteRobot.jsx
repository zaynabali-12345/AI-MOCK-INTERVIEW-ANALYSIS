import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CuteRobot() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || containerRef.current.childElementCount > 0) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xcc99ff, 0.5); // Purple fill light
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222, // Darker body
      metalness: 0.8,
      roughness: 0.3,
    });

    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xDA70D6 }); // Orchid color for eyes/smile

    // Robot group
    const robot = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    robot.add(head);

    // Screen (black face)
    const screenGeometry = new THREE.CircleGeometry(0.95, 32);
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1.8, 1.21);
    robot.add(screen);

    // Eyes
    const eyeGeometry = new THREE.TorusGeometry(0.18, 0.04, 16, 32);
    const leftEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    leftEye.position.set(-0.35, 2.0, 1.22);
    leftEye.rotation.y = Math.PI;
    robot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, glowMaterial);
    rightEye.position.set(0.35, 2.0, 1.22);
    rightEye.rotation.y = Math.PI;
    robot.add(rightEye);

    // Smile
    const smileCurve = new THREE.EllipseCurve(
      0, 0,
      0.4, 0.25,
      Math.PI, Math.PI * 2,
      false,
      0
    );
    const smilePoints = smileCurve.getPoints(50);
    const smileGeometry = new THREE.BufferGeometry().setFromPoints(smilePoints);
    const smileMaterial = new THREE.LineBasicMaterial({ color: 0xDA70D6, linewidth: 3 }); // Orchid color
    const smile = new THREE.Line(smileGeometry, smileMaterial);
    smile.position.set(0, 1.5, 1.22);
    robot.add(smile);

    // Headphones - left
    const earGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-1.35, 1.8, 0);
    leftEar.castShadow = true;
    robot.add(leftEar);

    // Headphones - right
    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(1.35, 1.8, 0);
    rightEar.castShadow = true;
    robot.add(rightEar);

    // Headphone band
    const bandCurve = new THREE.EllipseCurve(
      0, 0,
      1.35, 1.0,
      0, Math.PI,
      false,
      0
    );
    const bandPoints = bandCurve.getPoints(50).map(p => new THREE.Vector3(p.x, p.y, 0));
    const bandGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(bandPoints),
      50,
      0.08,
      8,
      false
    );
    const band = new THREE.Mesh(bandGeometry, bodyMaterial);
    band.position.set(0, 2.3, 0);
    band.castShadow = true;
    robot.add(band);

    // Body
    const bodyGeometry = new THREE.SphereGeometry(1.0, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    body.castShadow = true;
    robot.add(body);

    // Chest circle
    const chestGeometry = new THREE.RingGeometry(0.25, 0.32, 32);
    const chest = new THREE.Mesh(chestGeometry, glowMaterial);
    chest.position.set(0, 0.3, 0.98);
    robot.add(chest);

    scene.add(robot);

    // Animation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      targetRotationY = mouseX * 0.3;
      targetRotationX = mouseY * 0.2;

      robot.rotation.y += (targetRotationY - robot.rotation.y) * 0.05;
      robot.rotation.x += (targetRotationX - robot.rotation.x) * 0.05;

      // Gentle floating animation
      robot.position.y = Math.sin(Date.now() * 0.001) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
