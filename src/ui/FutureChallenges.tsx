import { presentationData } from '../data/presentation'

export function FutureChallenges() {
  const data = presentationData.futureChallenges
  return (
    <div className="future-challenges">
      <div className="future-challenges__ring">
        <div className="future-challenges__core">
          <strong>{data.core.title}</strong>
          <span>{data.core.subtitle}</span>
        </div>
        {data.themes.map((theme) => (
          <div key={theme.id} className={`future-challenges__node future-challenges__node--${theme.id}`}>
            <span className="future-challenges__number">{theme.number}</span>
            <strong>{theme.title}</strong>
            <p>{theme.body}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
