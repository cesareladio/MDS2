import { B2Widget } from '../ui/B2Widget'
import { ChilePeruScene } from '../ui/ChilePeruScene'
import { ClosingMessage } from '../ui/ClosingMessage'
import { EfficiencyFlow } from '../ui/EfficiencyFlow'
import { FutureChallenges } from '../ui/FutureChallenges'
import { IntroBrand } from '../ui/IntroBrand'
import { OneGdneScene } from '../ui/OneGdneScene'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { StoryCopy } from '../ui/StoryCopy'
import { ValueOverview } from '../ui/ValueOverview'
import { EarthScene } from '../experience/scene/EarthScene'
import { StoryDirector } from '../experience/story/StoryDirector'
import { useExperienceStore } from '../store/experienceStore'

export function Experience() {
  const phase = useExperienceStore((state) => state.phase)

  return (
    <div className="experience">
      <a className="skip-link" href="#oneGdne">Saltar a ONE GDN-e</a>
      <EarthScene />
      <StoryDirector />

      <main id="story">
        <section id="intro" className="chapter chapter--intro" aria-label="Introducción de marca"><IntroBrand /></section>
        <section id="chilePeru" className="chapter chapter--chilePeru"><ChilePeruScene /></section>
        <section id="oneGdne" className="chapter chapter--oneGdne"><OneGdneScene /></section>
        <section id="efficiency" className="chapter chapter--efficiency"><StoryCopy index="04" kicker="Eficiencia" title={<>AI + <em>AUTOMATION</em></>} align="center"><EfficiencyFlow /></StoryCopy></section>
        <section id="value" className="chapter chapter--value"><StoryCopy index="05" kicker="Valor" title={<>Dónde creamos valor<br /><em>y hacia dónde crecemos</em></>} align="center"><ValueOverview /></StoryCopy></section>
        <section id="challenges" className="chapter chapter--challenges"><StoryCopy index="06" kicker="Desafíos futuros" title={<>Una red conectada<br /><em>para los desafíos del futuro</em></>} align="center"><FutureChallenges /></StoryCopy></section>
        <section id="closing" className="chapter chapter--closing"><ClosingMessage /></section>
      </main>

      {phase !== 'intro' && <ProgressIndicator />}
      <B2Widget />
      <div className="screen-grain" aria-hidden="true" />
    </div>
  )
}
