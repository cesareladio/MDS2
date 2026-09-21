import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { configureEarthTexture, createFallbackSpecular, earthAssetUrls } from '../../lib/earthTexture'

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vViewDir = normalize(cameraPosition - worldPos);
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
    vec3 day = texture2D(uDay, vUv).rgb;
    vec3 night = texture2D(uNight, vUv).rgb;
    float spec = texture2D(uSpecular, vUv).r;
    float NdotL = dot(vWorldNormal, normalize(uSunDir));
    float terminator = smoothstep(-0.12, 0.22, NdotL);
    vec3 litDay = day * (0.24 + max(0.0, NdotL) * 1.05);
    float nightBlend = smoothstep(0.14, -0.14, NdotL) * uNightIntensity;
    vec3 litNight = night * nightBlend * 1.35;
    float specMask = spec * (1.0 - terminator * 0.5 + 0.5);
    float specPow = pow(max(0.0, dot(reflect(-normalize(uSunDir), vNormal), vViewDir)), 28.0);
    vec3 specColor = vec3(0.16, 0.34, 0.62) * specMask * specPow * 1.2;
    vec3 color = mix(litNight, litDay, terminator) + specColor;
    gl_FragColor = vec4(color * mix(0.12, 1.0, uExposure), 1.0);
  }
`

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
    float cloud = texture2D(uClouds, vUv).r;
    float cloudMask = smoothstep(0.74, 0.94, cloud);
    float NdotL = dot(vWorldNormal, normalize(uSunDir));
    float alpha = cloudMask * uOpacity;
    float light = 0.35 + max(0.0, NdotL) * 0.45;
    gl_FragColor = vec4(vec3(light), alpha);
  }
`

export function Earth() {
  const earthMesh = useRef<THREE.Mesh>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const [day, night, cloud] = useLoader(THREE.TextureLoader, [earthAssetUrls.day, earthAssetUrls.night, earthAssetUrls.clouds])
  const textures = useMemo(() => ({
    day: configureEarthTexture(day, true),
    night: configureEarthTexture(night, true),
    clouds: configureEarthTexture(cloud),
    specular: createFallbackSpecular(),
  }), [day, night, cloud])
  const sunDir = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), [])
  const introExposure = Math.min(1, Math.max(0, scroll / 0.11))
  const earthUniforms = useMemo(() => ({
    uDay: { value: textures.day }, uNight: { value: textures.night }, uSpecular: { value: textures.specular },
    uSunDir: { value: sunDir }, uNightIntensity: { value: 1 }, uExposure: { value: introExposure },
  }), [textures, sunDir, introExposure])
  const cloudUniforms = useMemo(() => ({ uClouds: { value: textures.clouds }, uSunDir: { value: sunDir }, uOpacity: { value: 0.02 } }), [textures, sunDir])

  useEffect(() => () => {
    textures.day.dispose(); textures.night.dispose(); textures.clouds.dispose(); textures.specular.dispose()
  }, [textures])

  useFrame((_, delta) => {
    const introToGlobal = THREE.MathUtils.smoothstep(scroll, 0.08, 0.2)
    const globalToLatam = THREE.MathUtils.smoothstep(scroll, 0.24, 0.32)
    const latamToSnapshot = THREE.MathUtils.smoothstep(scroll, 0.34, 0.4)
    const snapshotToExplore = THREE.MathUtils.smoothstep(scroll, 0.44, 0.52)

    const globalOpacity = THREE.MathUtils.lerp(0.02, 0.045, introToGlobal)
    const latamOpacity = THREE.MathUtils.lerp(globalOpacity, 0.02, globalToLatam)
    const snapshotOpacity = THREE.MathUtils.lerp(latamOpacity, 0.012, latamToSnapshot)
    const exploreOpacity = THREE.MathUtils.lerp(snapshotOpacity, 0.005, snapshotToExplore)

    cloudUniforms.uOpacity.value = exploreOpacity
    if (!reduced && clouds.current) clouds.current.rotation.y += delta * 0.004
    if (earthMesh.current && earthMesh.current.material instanceof THREE.ShaderMaterial) {
      earthMesh.current.material.uniforms.uExposure.value = introExposure
    }
  })

  return (
    <>
      <mesh ref={earthMesh}>
        <sphereGeometry args={[2, 128, 128]} />
        <shaderMaterial vertexShader={earthVertexShader} fragmentShader={earthFragmentShader} uniforms={earthUniforms} />
      </mesh>
      <mesh ref={clouds} scale={1.008}>
        <sphereGeometry args={[2, 96, 96]} />
        <shaderMaterial vertexShader={cloudVertexShader} fragmentShader={cloudFragmentShader} uniforms={cloudUniforms} transparent depthWrite={false} blending={THREE.NormalBlending} />
      </mesh>
    </>
  )
}
