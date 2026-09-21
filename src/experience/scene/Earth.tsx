import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { createEarthTextures } from '../../lib/earthTexture'

/* ────────────────────────────────────────────────────────────────────────────
   Custom day/night terminator shader with intro exposure control
   ─────────────────────────────────────────────────────────────────────────── */
const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpecular;
  uniform vec3 uSunDir;
  uniform float uNightIntensity;
  uniform float uExposure;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 day    = texture2D(uDay,     vUv).rgb;
    vec3 night  = texture2D(uNight,   vUv).rgb;
    float spec  = texture2D(uSpecular, vUv).r;

    // Sun term (0 = dark side, 1 = full light)
    float NdotL = dot(vWorldNormal, normalize(uSunDir));
    float terminator = smoothstep(-0.12, 0.22, NdotL);

    // Diffuse shading on day side
    float diffuse = max(0.0, NdotL);
    vec3 litDay = day * (0.18 + diffuse * 1.0);

    // City lights only on dark side, fading through terminator
    float nightBlend = smoothstep(0.14, -0.14, NdotL) * uNightIntensity;
    vec3 litNight = night * nightBlend * 1.8;

    // Basic specular on ocean (spec map = grey on ocean, near-black on land)
    float specMask = spec * (1.0 - terminator * 0.5 + 0.5);
    float specPow  = pow(max(0.0, dot(reflect(-normalize(uSunDir), vNormal), vViewDir)), 28.0);
    vec3 specColor = vec3(0.18, 0.42, 0.82) * specMask * specPow * 1.8;

    // Combine with exposure control (during intro, Earth is darker)
    vec3 color = mix(litNight, litDay, terminator) + specColor;
    color *= mix(0.2, 1.0, uExposure);

    gl_FragColor = vec4(color, 1.0);
  }
`

/* ────────────────────────────────────────────────────────────────────────────
   Cloud shader (alpha-blended overlay, slight glow toward sun)
   ─────────────────────────────────────────────────────────────────────────── */
const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = /* glsl */ `
  uniform sampler2D uClouds;
  uniform vec3 uSunDir;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    float alpha = texture2D(uClouds, vUv).r * uOpacity;
    float NdotL = dot(vWorldNormal, normalize(uSunDir));
    float light = 0.55 + max(0.0, NdotL) * 0.7;
    gl_FragColor = vec4(vec3(light), alpha);
  }
`

/* ────────────────────────────────────────────────────────────────────────────
   Earth component
   ─────────────────────────────────────────────────────────────────────────── */
export function Earth() {
  const group  = useRef<THREE.Group>(null)
  const earthMesh = useRef<THREE.Mesh>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const textures = useMemo(() => createEarthTextures(), [])

  // Sun direction — roughly lit from the right/front to show lit side facing camera
  const sunDir = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), [])

  // Intro exposure: Earth dims during intro and brightens as we scroll past (~12% scroll window)
  const introExposure = Math.min(1, scroll * 8.5)

  const earthUniforms = useMemo(() => ({
    uDay:          { value: textures.day },
    uNight:        { value: textures.night },
    uSpecular:     { value: textures.specular },
    uSunDir:       { value: sunDir },
    uNightIntensity: { value: 1.0 },
    uExposure:     { value: introExposure },
  }), [textures, sunDir, introExposure])

  const cloudUniforms = useMemo(() => ({
    uClouds:  { value: textures.clouds },
    uSunDir:  { value: sunDir },
    uOpacity: { value: 0.3 },
  }), [textures, sunDir])

  useEffect(() => () => {
    textures.day.dispose()
    textures.night.dispose()
    textures.specular.dispose()
    textures.clouds.dispose()
  }, [textures])

  useFrame((_, delta) => {
    if (reduced) return
    if (group.current)  group.current.rotation.y  += delta * 0.010
    if (clouds.current) clouds.current.rotation.y += delta * 0.015
    
    // Update exposure uniform each frame
    if (earthMesh.current && earthMesh.current.material instanceof THREE.ShaderMaterial) {
      (earthMesh.current.material as THREE.ShaderMaterial).uniforms.uExposure.value = introExposure
    }
  })

  return (
    <group ref={group} rotation={[0, -Math.PI / 2, 0]}>
      {/* Main globe */}
      <mesh ref={earthMesh}>
        <sphereGeometry args={[2, 128, 128]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={clouds} scale={1.007}>
        <sphereGeometry args={[2, 96, 96]} />
        <shaderMaterial
          vertexShader={cloudVertexShader}
          fragmentShader={cloudFragmentShader}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
