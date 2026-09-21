import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useExperienceStore } from '../../store/experienceStore'

export function WebGLDiagnostics() {
  const { gl } = useThree()
  const phase = useExperienceStore((state) => state.phase)

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

  useEffect(() => {
    if (phase !== 'engine') return
    console.debug('[WEBGL ENGINE INFO]', {
      memory: gl.info.memory,
      render: gl.info.render,
    })
  }, [gl, phase])

  return null
}
