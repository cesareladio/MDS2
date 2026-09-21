import * as THREE from 'three'

export interface EarthTextures {
  day: THREE.Texture
  night: THREE.Texture
  clouds: THREE.Texture
  specular: THREE.Texture
}

export function configureEarthTexture(texture: THREE.Texture, color = false) {
  texture.wrapS = THREE.RepeatWrapping
  texture.anisotropy = Math.min(8, texture.anisotropy || 1)
  if (color) texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function createFallbackSpecular(width = 512, height = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.fillStyle = '#777'
  context.fillRect(0, 0, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  return configureEarthTexture(texture)
}

export const earthAssetUrls = {
  day: '/textures/earth/earth-day.jpg',
  night: '/textures/earth/earth-night.jpg',
  clouds: '/textures/earth/earth-clouds.png',
}
