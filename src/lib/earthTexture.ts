import * as THREE from 'three'

export interface EarthTextures {
  day: THREE.Texture
  night: THREE.Texture
  specular: THREE.Texture
}

export function configureEarthTexture(texture: THREE.Texture, color = false, maxAnisotropy = 8) {
  texture.wrapS = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = Math.min(8, maxAnisotropy)
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.needsUpdate = true
  return texture
}

export const earthAssetUrls = {
  day: '/textures/earth/earth-day-4k.jpg',
  night: '/textures/earth/earth-night-4k.jpg',
  specular: '/textures/earth/earth-specular.jpg',
}
