const profile = require('libnpm/profile')
const log = require('npmlog')
const figgyPudding = require('figgy-pudding')
const npmConfig = require('npm/lib/config/figgy-config.js')
const output = require('npm/lib/utils/output.js')

const LoginOpts = figgyPudding({
  'always-auth': {},
  creds: {},
  log: { default: () => log },
  registry: {},
  scope: {}
})

// 考虑到使用场景，去掉了loginWeb的逻辑，直接loginCouch
async function login(creds, registry, scope) {
  const opts = LoginOpts(npmConfig()).concat({ scope, registry, creds })
  const u = opts.creds.username
  const p = opts.creds.password
  if (!(u && p)) throw err

  return profile.loginCouch(u, p, opts) // login without otp
  .catch((err) => { // adduserCouch
    if (err.code === 'EOTP') throw err
    const u = opts.creds.username
    const p = opts.creds.password
    const e = opts.creds.email
    if (!(u && p && e)) throw err
    return profile.adduserCouch(u, e, p, opts)
  })
  .catch((err) => { // loginCouch with otp
    if (err.code !== 'EOTP') throw err
    const otp = creds.otp
    if (!otp) {
      throw new Error('invalid otp code')
    }
    return profile.loginCouch(u, p, opts.concat({otp}))
  })
  .then((result) => {
    const newCreds = {}
    if (result && result.token) {
      newCreds.token = result.token
    } else {
      newCreds.username = opts.creds.username
      newCreds.password = opts.creds.password
      newCreds.email = opts.creds.email
      newCreds.alwaysAuth = opts['always-auth']
    }

    const usermsg = opts.creds.username ? ' user ' + opts.creds.username : ''
    opts.log.info('login', 'Authorized' + usermsg)
    const scopeMessage = opts.scope ? ' to scope ' + opts.scope : ''
    const userout = opts.creds.username ? ' as ' + opts.creds.username : ''
    output('Logged in%s%s on %s.', userout, scopeMessage, opts.registry)
    return newCreds
  })
}

module.exports = {
  login
}
