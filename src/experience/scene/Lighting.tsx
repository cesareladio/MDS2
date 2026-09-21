export function Lighting() {
  return (
    <>
      {/* Ambient — cool deep space fill */}
      <ambientLight intensity={0.18} color="#3a6ea0" />

      {/* Sun — key light, strong warm-white, matches uSunDir in Earth shader */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={2.8}
        color="#d5e8ff"
        castShadow={false}
      />

      {/* Rim / backlight from opposite side — deep blue */}
      <directionalLight
        position={[-6, -2, -3]}
        intensity={0.55}
        color="#0848b0"
      />

      {/* Subtle fill from below — prevents total blackout on dark hemisphere */}
      <pointLight
        position={[0, -6, 0]}
        intensity={1.4}
        distance={14}
        color="#071a3a"
      />
    </>
  )
}
