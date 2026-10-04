import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * AvatarErrorBoundary — React exige una clase para capturar errores de
 * render (p. ej. avatar.glb corrupto o con un esquema inesperado). Si
 * ocurre, se muestra `fallback` (AvatarB2Placeholder) en vez de romper el
 * resto de la experiencia.
 */
export class AvatarErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[B2] avatar.glb no se pudo renderizar, usando placeholder.', error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
