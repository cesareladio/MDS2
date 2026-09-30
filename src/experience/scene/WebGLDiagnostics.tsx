import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function WebGLDiagnostics() {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement

    const onContextLost = (event: Event) => {
      event.preventDefault()
      console.error('[WEBGL CONTEXT LOST]', performance.now())
    }

    const onContextRestored = () => {
      console.warn('[WEBGL CONTEXT RESTORED]', performance.now())
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
    }
  }, [gl])

  return null
}
