import { globalData } from '../data/global'
import { capabilities } from '../data/capabilities'
import { EarthScene } from '../experience/scene/EarthScene'
import { StoryDirector } from '../experience/story/StoryDirector'
import { CapabilityHUD } from '../ui/CapabilityHUD'
import { ClosingMessage } from '../ui/ClosingMessage'
import { ContinueStory } from '../ui/ContinueStory'
import { CountryHUD } from '../ui/CountryHUD'
import { ExploreCountry } from '../ui/ExploreCountry'
import { IntroBrand } from '../ui/IntroBrand'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { StoryCopy } from '../ui/StoryCopy'
import { useExperienceStore } from '../store/experienceStore'

export function Experience() {
  const exploring = useExperienceStore((state) => state.explorationMode)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  return (
    <div className={`experience ${exploring ? 'is-exploring' : ''}`}>
      <a className="skip-link" href="#explore">Saltar a exploración</a>
      <EarthScene />
      <StoryDirector />
      <main id="story">
        <section id="intro" className="chapter chapter--intro" aria-label="Introducción de marca"><IntroBrand /></section>

        <section id="global" className="chapter chapter--global">
          <StoryCopy index="02" kicker="Un mundo de oportunidades" title={<>Talento que<br />conecta continentes</>}>
            <div className="journey-steps"><span><i />Japan<small>Our origin</small></span><span><i />Spain<small>Growing together</small></span><span><i />LATAM<small>Talent without borders</small></span></div>
          </StoryCopy>
        </section>

        <section id="latam" className="chapter chapter--latam">
          <StoryCopy index="03" kicker="Chile + Perú" title={<>Two identities.<br /><em>One capability.</em></>}>
            <p>Diferentes historias.<br />Fortalezas únicas.<br />Un mismo propósito para IBIOL.</p>
            <strong className="gdne-label">One GDN-e</strong>
          </StoryCopy>
        </section>

        <section id="snapshot" className="chapter chapter--snapshot">
          <StoryCopy index="04" kicker="One GDN-e snapshot" title="La escala aparece en el territorio">
            <div className="snapshot-stats">
              <div><small>Perú</small><strong>{globalData.peruHC.toLocaleString('es-PE')}</strong><span>personas</span></div>
              <div><small>Chile</small><strong>{globalData.chileGdneHC}</strong><span>colaboradores GDN-e</span></div>
              <div className="is-pending"><small>HC conjunto</small><strong>TBD</strong><span>por confirmar</span></div>
            </div>
          </StoryCopy>
        </section>

        <section id="explore" className="chapter chapter--explore"><ExploreCountry /></section>

        <section id="complementarity" className="chapter chapter--complementarity">
          <StoryCopy index="06" kicker="Complementariedad" title={<>Dos fortalezas<br />que se potencian</>} align="center">
            <div className="complement-grid"><div><strong>Perú</strong><span>Scale & growth</span><span>Talent engine</span><span>Training</span><span>SAP & Testing</span><span>Diversity</span></div><div className="one-capability">One<br />capability</div><div><strong>Chile</strong><span>Maturity & experience</span><span>Backend & Data</span><span>Quality</span><span>Distributed talent</span><span>Regional experience</span></div></div>
            <p className="impact-line">Más talento. Más capacidades. Más impacto.</p>
          </StoryCopy>
        </section>

        <section id="engine" className="chapter chapter--engine">
          <StoryCopy index="07" kicker="Capability engine" title={<>Una capacidad integrada<br />lista para entregar valor</>}>
            <p className="engine-note">Selecciona los nodos para explorar la contribución de cada país. La oferta final permanece sujeta a validación.</p>
          </StoryCopy>
        </section>

        <section id="ibiol" className="chapter chapter--ibiol">
          <StoryCopy index="08" kicker="Nuestra propuesta para IBIOL" title={<>Una red conectada<br /><em>para los desafíos del futuro</em></>} align="center">
            <div className="capability-orbit-list">{capabilities.map((item) => <button key={item.id} onClick={() => selectCapability(item.id)}>{item.name}</button>)}</div>
            <div className="value-row"><span>+ Talento</span><span>+ Capacidades</span><span>+ Innovación</span><span>+ Impacto</span></div>
            <ContinueStory />
          </StoryCopy>
        </section>

        <section id="closing" className="chapter chapter--closing"><ClosingMessage /></section>
      </main>
      <CountryHUD />
      <CapabilityHUD />
      <ProgressIndicator />
      <div className="screen-grain" aria-hidden="true" />
    </div>
  )
}
