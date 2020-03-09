
const {
  adduserByLeagcy,
  adduserBySso,
  adduserBySsoUnsafe,
  checkSsoToken,
  runCmd,
  runCmdWithCreds
} = require('../src/index')

// adduserByLeagcy({
//   username: '',
//   password: '',
//   email: ''
// }, 'https://registry.npmjs.org')

// runCmd(['whoami'])

// const promise = adduserBySso('https://bnpm.byted.org')

// const promise = adduserBySso('https://bnpm.byted.org', undefined, (sso) => {
//   console.log(sso)
// })

// const promise = runCmdWithCreds(["whoami", "--registry=https://bnpm.byted.org"], {
//   token: ''
// })

const promise = adduserBySsoUnsafe('https://bnpm.byted.org')
.then(({ token, sso }) => {
  console.log(token, sso);
  return checkSsoToken(token, 'https://bnpm.byted.org')
})

// const promise = checkSsoToken('https://bnpm.byted.org', '')

promise.then(({token, sso}) => {
  console.log('#resp', token, sso)
}).catch(err => {
  console.log('#err', err)
})

