
const {
  adduserByLeagcy,
  adduserBySso,
  runCmd,
  runCmdWithCreds
} = require('../src/index')

// adduserByLeagcy({
//   username: '',
//   password: '',
//   email: ''
// }, 'https://registry.npmjs.org').catch(err => {
//   console.log('#err', err)
// })

runCmd(['whoami']).catch(err => {
  console.log('#err', err)
})

// adduserBySso('https://registry.npmjs.org').catch(err => {
//   console.log('#err', err)
// })

// runCmdWithCreds(["whoami", "--registry=https://registry.npmjs.org"], {
//   token: ''
// }).catch(err => {
//   console.log('#err', err)
// })
