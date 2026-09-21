import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'

/* ────────────────────────────────────────────────────────────────────────────
   Fresnel atmospheric glow shader
   – thin, bright limb on the front face (BackSide trick inverts normals)
   – softer outer halo shell
   ─────────────────────────────────────────────────────────────────────────── */
const atmoVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmoFragmentShader = /* glsl */ `
  uniform vec3  uRimColor;
  uniform float uRimPower;
  uniform float uRimIntensity;
  uniform float uInnerOpacity;

  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    // Fresnel: strong at grazing angles (limb), zero facing camera
    float cosA   = dot(vNormal, -vPositionNormal);
    float fresnel = pow(1.0 - clamp(cosA, 0.0, 1.0), uRimPower);

    // Two-layer: thin bright edge + broader diffuse corona
    float edge   = pow(1.0 - clamp(cosA, 0.0, 1.0), uRimPower * 1.6);
    float corona = pow(1.0 - clamp(cosA, 0.0, 1.0), uRimPower * 0.5) * 0.14;

    float alpha = (edge + corona) * uRimIntensity * uInnerOpacity;
    gl_FragColor = vec4(uRimColor * (fresnel * 1.4 + 0.15), alpha);
  }
`

const outerFragmentShader = /* glsl */ `
  uniform vec3  uRimColor;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() {
    float cosA   = dot(vNormal, -vPositionNormal);
    float fresnel = pow(1.0 - clamp(cosA, 0.0, 1.0), 2.8);
    gl_FragColor = vec4(uRimColor, fresnel * 0.028);
  }
`

interface AtmosphereProps {
  /** 0..1 — controls how opaque/intense the atmosphere appears (for intro morph) */
  intensity?: number
}

export function Atmosphere({ intensity = 1 }: AtmosphereProps) {
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const reduced  = useExperienceStore((state) => state.reducedMotion)

  // Pulsating very slightly when not reduced
  useFrame(({ clock }) => {
    if (reduced) return
    const breathe = 1.0 + Math.sin(clock.elapsedTime * 0.55) * 0.003
    if (innerRef.current) innerRef.current.scale.setScalar(breathe * 1.038)
    if (outerRef.current) outerRef.current.scale.setScalar(breathe * 1.095)
  })

  const innerUniforms = {
    uRimColor:     { value: new THREE.Color(0.18, 0.62, 1.0) },
    uRimPower:     { value: 3.6 },
    uRimIntensity: { value: 0.38 },
    uInnerOpacity: { value: intensity },
  }

  const outerUniforms = {
    uRimColor: { value: new THREE.Color(0.08, 0.38, 0.92) },
  }

  return (
    <group>
      {/* Inner bright limb */}
      <mesh ref={innerRef} scale={1.025}>
        <sphereGeometry args={[2, 80, 80]} />
        <shaderMaterial
          vertexShader={atmoVertexShader}
          fragmentShader={atmoFragmentShader}
          uniforms={innerUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer diffuse corona */}
      <mesh ref={outerRef} scale={1.04}>
        <sphereGeometry args={[2, 56, 56]} />
        <shaderMaterial
          vertexShader={atmoVertexShader}
          fragmentShader={outerFragmentShader}
          uniforms={outerUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
