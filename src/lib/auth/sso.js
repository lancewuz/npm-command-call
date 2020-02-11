'use strict'

const BB = require('bluebird')
const figgyPudding = require('figgy-pudding')
const log = require('npmlog')
const npmConfig = require('npm/lib/config/figgy-config.js')
const npmFetch = require('npm-registry-fetch')
const output = require('npm/lib/utils/output.js')
const otplease = require('npm/lib/utils/otplease.js')
const profile = require('libnpm/profile')

const SsoOpts = figgyPudding({
  ssoType: 'sso-type',
  'sso-type': {},
  ssoPollFrequency: 'sso-poll-frequency',
  'sso-poll-frequency': {}
})

const pollMaxTimes = 100
let pollIndex = 0

async function login(creds, registry, scope, cb, ssoTypeIn) {
  const opts = SsoOpts(npmConfig()).concat({ creds, registry, scope })
  const ssoType = ssoTypeIn || opts.ssoType

  if (!ssoType) {
    throw new Error('Missing option: sso-type')
  }

  // We're reusing the legacy login endpoint, so we need some dummy
  // stuff here to pass validation. They're never used.
  const auth = {
    username: 'npm_' + ssoType + '_auth_dummy_user',
    password: 'placeholder',
    email: 'support@npmjs.com',
    authType: ssoType
  }

  pollIndex = 0

  return otplease(opts,
    opts => profile.loginCouch(auth.username, auth.password, opts)
  ).then(({ token, sso }) => {
    if (!token) { throw new Error('no SSO token returned') }
    if (!sso) { throw new Error('no SSO URL returned by services') }

    if (typeof cb === 'function') {
      cb(sso)
    }

    return sleep(1000).then(() => {
      return pollForSession(registry, token, opts, scope)
    })
  })

}

function pollForSession(registry, token, opts, scope) {
  log.info('adduser', 'Polling for validated SSO session')
  pollIndex++
  return npmFetch.json(
    '/-/whoami', opts.concat({ registry, forceAuth: { token } })
  ).then(
    ({ username }) => username,
    err => {
      if (err.code === 'E401' && pollIndex <= pollMaxTimes) {
        return sleep(opts['sso-poll-frequency']).then(() => {
          return pollForSession(registry, token, opts, scope)
        })
      } else {
        throw err
      }
    }
  ).then(username => {
    log.info('adduser', 'Authorized user %s', username)
    var scopeMessage = scope ? ' to scope ' + scope : ''
    output('Logged in as %s%s on %s.', username, scopeMessage, registry)
    return { token }
  })
}

function sleep(time) {
  return new BB((resolve) => {
    setTimeout(resolve, time)
  })
}

module.exports = {
  login
}
