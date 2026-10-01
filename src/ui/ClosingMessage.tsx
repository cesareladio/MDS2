import { BrandLogo } from './BrandLogo'

export function ClosingMessage() {
  return (
    <div className="closing-message">

      <h2>ONE GDN-e</h2>
      <div>
        Una capacidad que construimos juntos.
        <br /><br />
        Diferentes historias.<br />
        Fortalezas complementarias.<br />
        Un mismo propósito para IBIOL.
      </div>
      <BrandLogo className="closing-message__logo" decorative />
    </div>
  )
}
