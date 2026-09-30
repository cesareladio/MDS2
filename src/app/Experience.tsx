import { ChallengesOverview } from '../ui/ChallengesOverview'
import { ClosingMessage } from '../ui/ClosingMessage'
import { CountryHUD } from '../ui/CountryHUD'
import { CountryPhotoPanel } from '../ui/CountryPhotoPanel'
import { EfficiencyFlow } from '../ui/EfficiencyFlow'
import { HistoryDual } from '../ui/HistoryDual'
import { IntroBrand } from '../ui/IntroBrand'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { StoryCopy } from '../ui/StoryCopy'
import { TerritoryOverview } from '../ui/TerritoryOverview'
import { EarthScene } from '../experience/scene/EarthScene'
import { StoryDirector } from '../experience/story/StoryDirector'
import { useExperienceStore } from '../store/experienceStore'

export function Experience() {
  const phase = useExperienceStore((state) => state.phase)
  const exploring = phase === 'explore'

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

        {/* 02 CHILE + PERÚ */}
        <section id="chilePeru" className="chapter chapter--chilePeru">
          <StoryCopy index="02" kicker="Chile + Perú" title={<>Two identities.<br /><em>One capability.</em></>}>
            <p>Diferentes historias.<br />Fortalezas complementarias.<br />Un mismo propósito para IBIOL.</p>
            <strong className="gdne-label">One GDN-e</strong>
            <div className="country-photo-row">
              <div className="country-photo-row__item country-photo-row__item--chile">
                <CountryPhotoPanel country="chile" />
                <span>Chile</span>
              </div>
              <div className="country-photo-row__item country-photo-row__item--peru">
                <CountryPhotoPanel country="peru" />
                <span>Perú</span>
              </div>
            </div>
          </StoryCopy>
        </section>

        {/* 03 NUESTRA HISTORIA */}
        <section id="history" className="chapter chapter--history">
          <StoryCopy index="03" kicker="Nuestra historia" title="Dos caminos, una capacidad" align="center">
            <HistoryDual />
            <p className="impact-line">Dos historias que hoy convergen<br />en una misma capacidad.</p>
          </StoryCopy>
        </section>

        {/* 04 TERRITORIO */}
        <section id="territory" className="chapter chapter--territory">
          <StoryCopy index="04" kicker="One GDN-e" title="La escala aparece en el territorio">
            <TerritoryOverview />
          </StoryCopy>
        </section>

        {/* 05 EXPLORE */}
        <section id="explore" className="chapter chapter--explore" />

        {/* 06 EFICIENCIA */}
        <section id="efficiency" className="chapter chapter--efficiency">
          <StoryCopy index="06" kicker="Eficiencia" title={<>Más capacidad.<br />Menos fricción.</>} align="center">
            <EfficiencyFlow />
          </StoryCopy>
        </section>

        {/* 07 DESAFÍOS / OPORTUNIDADES */}
        <section id="challenges" className="chapter chapter--challenges">
          <StoryCopy index="07" kicker="Desafíos / Oportunidades" title={<>Dónde creamos valor<br /><em>y hacia dónde crecemos</em></>}>
            <ChallengesOverview />
          </StoryCopy>
        </section>

        {/* 08 CLOSING */}
        <section id="closing" className="chapter chapter--closing">
          <ClosingMessage />
        </section>
      </main>

      <CountryHUD />
      {phase !== 'intro' && <ProgressIndicator />}
      <div className="screen-grain" aria-hidden="true" />
    </div>
  )
}
