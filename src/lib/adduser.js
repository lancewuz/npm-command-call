const { login: loginLegacy } = require('./auth/legacy');
const { login: loginSso } = require('./auth/sso');
const BB = require('bluebird');
const openUrl = BB.promisify(require('npm/lib/utils/open-url.js'));
const npm = require('npm/lib/npm');

let crypto;

try {
  crypto = require('crypto');
  // eslint-disable-next-line
} catch (ex) {}

async function adduserLegacy(userInfo, registry, scope, self = false) {
  if (!crypto) {
    throw new Error('You must compile node with ssl support to use the adduser feature');
  }
  return loginLegacy(userInfo, registry, scope).then(newCreds => {
    if (!self) {
      return updateCreds(newCreds, registry, scope);
    } else {
      return newCreds;
    }
  });
}

async function adduserSso(registry, scope, cb, ssoType = 'oauth', self = false) {
  if (!crypto) {
    throw new Error('You must compile node with ssl support to use the adduser feature');
  }
  npm.config.set('auth-type', '');
  npm.config.set('sso-type', ssoType);
  if (typeof cb != 'function') {
    cb = function(ssoUri) {
      openUrl(ssoUri, 'to complete your login please visit');
    };
  }
  return loginSso({}, registry, scope, cb, ssoType).then(newCreds => {
    if (!self) {
      return updateCreds(newCreds, registry, scope);
    } else {
      return newCreds;
    }
  });
}

function updateCreds(newCreds, regis, scop) {
  const registry = regis || npm.config.get('registry');
  const scope = scop || npm.config.get('scope');

  npm.config.del('_token', 'user'); // prevent legacy pollution
  if (scope) npm.config.set(scope + ':registry', registry, 'user');
  npm.config.setCredentialsByURI(registry, newCreds);

  return new Promise((resolve, reject) => {
    npm.config.save('user', err => {
      if (err) {
        reject(err);
      } else {
        resolve(newCreds);
      }
    });
  });
}

module.exports.adduserLegacy = adduserLegacy;
module.exports.adduserSso = adduserSso;
