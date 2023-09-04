import { isMobile } from './menus/components/common'

if (process.env.NODE_ENV === 'development' && isMobile()) {
  require('eruda').default.init()
  console.log('JS Loaded in', Date.now() - window.startLoad)
}
