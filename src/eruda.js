if (process.env.NODE_ENV === 'development') {
  require('eruda').default.init()
  console.log('JS Loaded in', Date.now() - window.startLoad)
}
