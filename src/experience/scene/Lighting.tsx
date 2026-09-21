export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.32} color="#6dafff" />
      <directionalLight position={[4, 2, 6]} intensity={3.2} color="#d8e9ff" />
      <pointLight position={[-4, -1, 3]} intensity={9} distance={12} color="#0d7aff" />
    </>
  )
}
