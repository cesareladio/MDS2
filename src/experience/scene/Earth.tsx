import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { configureEarthTexture, earthAssetUrls } from '../../lib/earthTexture'

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
    day = pow(day, vec3(0.94));
    float dayLuminance = dot(day, vec3(0.2126, 0.7152, 0.0722));
    day = mix(vec3(dayLuminance), day, 1.05);
    vec3 night = texture2D(uNight, vUv).rgb;
    float spec = texture2D(uSpecular, vUv).r;
    float NdotL = dot(vWorldNormal, normalize(uSunDir));
    float terminator = smoothstep(-0.12, 0.22, NdotL);
    vec3 litDay = day * (0.52 + max(0.0, NdotL) * 0.58);
    float nightBlend = smoothstep(0.02, -0.22, NdotL) * uNightIntensity;
    vec3 litNight = night * nightBlend;
    float specPow = pow(max(0.0, dot(reflect(-normalize(uSunDir), vNormal), vViewDir)), 36.0);
    vec3 specColor = vec3(0.10, 0.24, 0.42) * spec * specPow * 0.75;
    vec3 color = mix(litNight, litDay, terminator) + specColor;
    gl_FragColor = vec4(color * mix(0.12, 1.0, uExposure), 1.0);
  }
`

export function Earth() {
  const earthMesh = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const { gl } = useThree()
  const [day, night, specular] = useLoader(THREE.TextureLoader, [earthAssetUrls.day, earthAssetUrls.night, earthAssetUrls.specular])
  const textures = useMemo(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    return {
      day: configureEarthTexture(day, true, maxAnisotropy),
      night: configureEarthTexture(night, true, maxAnisotropy),
      specular: configureEarthTexture(specular, false, maxAnisotropy),
    }
  }, [day, night, specular, gl])
  const sunDir = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), [])
  const introExposure = Math.min(1, Math.max(0, scroll / 0.11))
  const earthUniforms = useMemo(() => ({
    uDay: { value: textures.day }, uNight: { value: textures.night }, uSpecular: { value: textures.specular },
    uSunDir: { value: sunDir }, uNightIntensity: { value: 0.75 }, uExposure: { value: introExposure },
  }), [textures, sunDir, introExposure])
  useEffect(() => () => {
    textures.day.dispose(); textures.night.dispose(); textures.specular.dispose()
  }, [textures])

  useFrame(() => {
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
    </>
  )
}
