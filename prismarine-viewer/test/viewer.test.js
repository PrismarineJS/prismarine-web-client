/* eslint-env jest */
/* global page */

const supportedVersions = require('../').supportedVersions

const path = require('path')
const MC_SERVER_PATH = path.join(__dirname, 'server')
const os = require('os')

const Wrap = require('minecraft-wrap').Wrap

const { firstVersion, lastVersion } = require('./parallel')

const download = require('minecraft-wrap').download

supportedVersions.forEach(function (supportedVersion, i) {
  if (!(i >= firstVersion && i <= lastVersion)) { return }

  const PORT = Math.round(30000 + Math.random() * 20000)
  const mcData = require('minecraft-data')(supportedVersion)
  const version = mcData.version
  const MC_SERVER_JAR_DIR = process.env.MC_SERVER_JAR_DIR || os.tmpdir()
  const MC_SERVER_JAR = MC_SERVER_JAR_DIR + '/minecraft_server.' + version.minecraftVersion + '.jar'
  const wrap = new Wrap(MC_SERVER_JAR, MC_SERVER_PATH + '_' + supportedVersion, {
    minMem: 1024,
    maxMem: 1024
  })
  wrap.on('line', function (line) {
    console.log(line)
  })

  describe('client ' + version.minecraftVersion, function () {
    beforeAll(download.bind(null, version.minecraftVersion, MC_SERVER_JAR), 3 * 60 * 1000)

    afterAll(function (done) {
      wrap.deleteServerData(function (err) {
        if (err) { console.log(err) }
        done(err)
      })
    }, 3 * 60 * 1000)

    describe('offline', function () {
      beforeAll(function (done) {
        console.log(new Date() + 'starting server ' + version.minecraftVersion)
        wrap.startServer({
          'online-mode': 'false',
          'server-port': PORT,
          motd: 'test1234',
          'max-players': 120
        }, function (err) {
          if (err) { console.log(err) }
          console.log(new Date() + 'started server ' + version.minecraftVersion)
          done(err)
        })
      }, 3 * 60 * 1000)

      afterAll(function (done) {
        console.log(new Date() + 'stopping server' + version.minecraftVersion)
        wrap.stopServer(function (err) {
          if (err) { console.log(err) }
          console.log(new Date() + 'stopped server ' + version.minecraftVersion)
          done(err)
        })
      }, 3 * 60 * 1000)

      it('doesn\'t crash', function (done) {
        console.log('test')
        done()
      })

      it('starts the viewer', function (done) {
        const mineflayer = require('mineflayer')
        const mineflayerViewer = require('../').mineflayer
        setTimeout(() => done(new Error('too slow !!!')), 180000)

        const bot = mineflayer.createBot({
          username: 'Bot',
          port: PORT,
          version: supportedVersion
        })

        bot.once('spawn', () => {
          mineflayerViewer(bot, { port: 3000 })

          function exit (err) {
            bot.viewer.close()
            bot.end()
            done(err)
          }

          page.goto('http://localhost:3000').then(() => {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()))

            page.on('error', err => {
              exit(err)
            })

            page.on('pageerror', pageerr => {
              exit(pageerr)
            })
            setTimeout(() => {
              page.screenshot({ path: path.join(__dirname, `test_${supportedVersion}.png`) }).then(() => exit()).catch(err => exit(err))
            }, 120000)
          }).catch(err => exit(err))
        })
      }, 180000)
    })
  })
})
