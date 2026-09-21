export function ContinueStory() {
  return <button className="continue-button" onClick={() => document.getElementById('closing')?.scrollIntoView({ behavior: 'smooth' })}>Continue story <span>↓</span></button>
}
