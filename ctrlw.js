// Ctrl-W Workaround
addEventListener(
  'beforeunload',
  function (e) {
    alert("Sprinting with CTRL+W doesn't work, so please install this plugin. ")
    window.open('https://chrome.google.com/webstore/detail/better-ctrl-w/jfknaapblnppeflfamkegnnonlfgokhp', '_blank')
  },
  true
)
