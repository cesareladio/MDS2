import { globalData } from '../data/global'
import { capabilities } from '../data/capabilities'
import { countryIdentity } from '../data/countryIdentity'
import { EarthScene } from '../experience/scene/EarthScene'
import { StoryDirector } from '../experience/story/StoryDirector'
import { CapabilityHUD } from '../ui/CapabilityHUD'
import { ClosingMessage } from '../ui/ClosingMessage'
import { ContinueStory } from '../ui/ContinueStory'
import { CountryHUD } from '../ui/CountryHUD'
import { IntroBrand } from '../ui/IntroBrand'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { StoryCopy } from '../ui/StoryCopy'
import { useExperienceStore } from '../store/experienceStore'

export function Experience() {
  const exploring = useExperienceStore((state) => state.explorationMode)
  const selectedCapability = useExperienceStore((state) => state.selectedCapability)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  return (
    <div className={`experience ${exploring ? 'is-exploring' : ''}`}>
      <a className="skip-link" href="#explore">Saltar a exploración</a>
      <EarthScene />
      <StoryDirector />

      <main id="story">
        {/* 01 INTRO */}
        <section id="intro" className="chapter chapter--intro" aria-label="Introducción de marca">
          <IntroBrand />
        </section>

        {/* 02 GLOBAL */}
        <section id="global" className="chapter chapter--global">
          <StoryCopy index="02" kicker="Un mundo de oportunidades" title={<>Talento que<br />conecta continentes</>}>
            <div className="journey-steps">
              <span><i />Japan<small>Our origin</small></span>
              <span><i />Spain<small>Growing together</small></span>
              <span><i />LATAM<small>Talent without borders</small></span>
            </div>
          </StoryCopy>
        </section>

        {/* 03 LATAM */}
        <section id="latam" className="chapter chapter--latam">
          <StoryCopy index="03" kicker="Chile + Perú" title={<>Two identities.<br /><em>One capability.</em></>}>
            <p>Diferentes historias.<br />Fortalezas únicas.<br />Un mismo propósito para IBIOL.</p>
            <strong className="gdne-label">One GDN-e</strong>
          </StoryCopy>
        </section>

        {/* 04 SNAPSHOT */}
        <section id="snapshot" className="chapter chapter--snapshot">
          <StoryCopy index="04" kicker="One GDN-e snapshot" title="La escala aparece en el territorio">
            <div className="snapshot-identities">
              <strong className="snapshot-gdne">ONE GDN-e</strong>
              <div className="snapshot-country snapshot-country--peru">
                <img src={countryIdentity.peru.flag} alt="" />
                <small>{countryIdentity.peru.name}</small>
                <strong>{globalData.peruHC.toLocaleString('es-PE')}</strong>
                <span>personas</span>
                <em>{countryIdentity.peru.tagline}</em>
              </div>
              <div className="snapshot-country snapshot-country--chile">
                <img src={countryIdentity.chile.flag} alt="" />
                <small>{countryIdentity.chile.name}</small>
                <strong>{globalData.chileGdneHC}</strong>
                <span>colaboradores GDN-e</span>
                <em>{countryIdentity.chile.tagline}</em>
              </div>
              <div className="snapshot-pending">HC conjunto · por confirmar</div>
            </div>
          </StoryCopy>
        </section>

        {/* 05 EXPLORE */}
        <section id="explore" className="chapter chapter--explore" />

        {/* 06 COMPLEMENTARITY */}
        <section id="complementarity" className="chapter chapter--complementarity">
          <StoryCopy index="06" kicker="Complementariedad" title={<>Dos fortalezas<br />que se potencian</>} align="center">
            <div className="complement-grid">
              <div className="complement-country complement-country--peru">
                <strong>Perú</strong>
                <span>Scale &amp; growth</span>
                <span>Talent engine</span>
                <span>Training</span>
                <span>SAP &amp; Testing</span>
                <span>Diversity</span>
              </div>
              <div className="complement-center">
                <svg className="complement-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="complement-connectors__peru" d="M 0 50 C 28 50, 34 50, 42 50" />
                  <path className="complement-connectors__chile" d="M 100 50 C 72 50, 66 50, 58 50" />
                </svg>
                <div className="one-capability">One<br />capability</div>
              </div>
              <div className="complement-country complement-country--chile">
                <strong>Chile</strong>
                <span>Maturity &amp; experience</span>
                <span>Backend &amp; Data</span>
                <span>Quality</span>
                <span>Distributed talent</span>
                <span>Regional experience</span>
              </div>
            </div>
            <p className="impact-line">Más talento. Más capacidades. Más impacto.</p>
          </StoryCopy>
        </section>

        {/* 07 ENGINE */}
        <section id="engine" className="chapter chapter--engine">
          <StoryCopy index="07" kicker="Capability engine" title={<>Una capacidad integrada<br />lista para entregar valor</>}>
            <div className="engine-capability-list">
              {capabilities.map((item) => (
                <button
                  key={item.id}
                  className={selectedCapability === item.id ? 'is-active' : ''}
                  onClick={() => selectCapability(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </StoryCopy>
        </section>

        {/* 08 IBIOL */}
        <section id="ibiol" className="chapter chapter--ibiol">
          <StoryCopy index="08" kicker="Nuestra propuesta para IBIOL" title={<>Una red conectada<br /><em>para los desafíos del futuro</em></>}>
            <div className="capability-orbit-list">
              {capabilities.map((item) => (
                <button key={item.id} onClick={() => selectCapability(item.id)}>{item.name}</button>
              ))}
            </div>
            <div className="value-row">
              <span>+ Talento</span>
              <span>+ Capacidades</span>
              <span>+ Innovación</span>
              <span>+ Impacto</span>
            </div>
            <ContinueStory />
          </StoryCopy>
        </section>

        {/* 09 CLOSING */}
        <section id="closing" className="chapter chapter--closing">
          <ClosingMessage />
        </section>
      </main>

      <CountryHUD />
      <CapabilityHUD />
      <ProgressIndicator />
      <div className="screen-grain" aria-hidden="true" />
    </div>
  )
}
