import Stats from 'stats.js'
import StatsGl from 'stats-gl'
import { isCypress } from './utils'

const stats = new Stats()
const stats2 = new Stats()
// in my case values are good: gpu: < 0.5, cpu < 0.15
const statsGl = new StatsGl()
stats2.showPanel(2)

let total = 0
const addStat = (dom, size = 80) => {
  dom.style.left = ''
  dom.style.right = `${total}px`
  dom.style.width = '80px'
  document.body.appendChild(dom)
  total += size
}
addStat(stats.dom)
addStat(stats2.dom)
addStat(statsGl.container)

if (localStorage.hideStats || isCypress()) {
  stats.dom.style.display = 'none'
  stats2.dom.style.display = 'none'
  statsGl.container.style.display = 'none'
}

export const initWithRenderer = (canvas) => {
  statsGl.init(canvas)
  statsGl.container.style.display = 'flex'
  statsGl.container.style.justifyContent = 'flex-end'
  let i = 0
  for (const _child of statsGl.container.children) {
    const child = _child as HTMLElement
    if (i++ === 0) {
      child.style.display = 'none'
    }
    child.style.position = ''
  }
}

export const statsStart = () => {
  stats.begin()
  stats2.begin()
  statsGl.begin()
}
export const statsEnd = () => {
  stats.end()
  stats2.end()
  statsGl.end()
}
