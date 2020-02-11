const unsupported = require('npm/lib/utils/unsupported.js');
unsupported.checkForBrokenNode();

const log = require('npmlog');
log.pause(); // will be unpaused when config is loaded.
log.info('it worked if it ends with', 'ok');

unsupported.checkForUnsupportedNode();

const npm = require('npm/lib/npm.js');
const npmconf = require('npm/lib/config/core.js');

const { adduserLegacy, adduserSso } = require('./lib/adduser');
const whoami = require('./lib/whoami');
const publish = require('./lib/publish');

const configDefs = npmconf.defs;
const shorthands = configDefs.shorthands;
const types = configDefs.types;
const nopt = require('nopt');

log.info('using', 'npm@%s', npm.version);
log.info('using', 'node@%s', process.version);

const credsCmds = {
  whoami,
  publish,
};

npm.config.getCredentialsByURI = function() {
  return 'cc';
};

async function runCmd(argvArr) {
  if (!argvArr.length) throw new Error('invalid argvArr');
  const conf = nopt(types, shorthands, argvArr, 0);
  const npmArgv = conf.argv.remain;
  if (!npm.deref(npmArgv[0])) {
    throw new Error('invalid command');
  }
  conf.usage = true;
  const npmCommand = npmArgv.shift();

  if (['help', 'adduser', 'login'].includes(npmCommand)) {
    throw new Error(`Unsopported command: ${npmCommand}`);
  }

  return new Promise((resolve, reject) => {
    npm.load(conf, function(er) {
      if (er) {
        reject(er);
      }

      npm.commands[npmCommand](npmArgv, function(err) {
        if (!err && !npm.config.get('json') && !npm.config.get('parseable') && npmCommand !== 'completion') {
          resolve(`run npm ${npmCommand} successfully!`);
        } else {
          reject(err);
        }
      });
    });
  });
}

async function runCmdWithCreds(argvArr, creds = {}, registry) {
  if (!argvArr.length) throw new Error('invalid argvArr');
  const conf = nopt(types, shorthands, argvArr, 0);
  const npmArgv = conf.argv.remain;
  if (!npm.deref(npmArgv[0])) {
    throw new Error('invalid command');
  }
  conf.usage = true;
  const npmCommand = npmArgv.shift();

  return new Promise((resolve, reject) => {
    npm.load(conf, function(er) {
      if (er) {
        reject(er);
      } else {
        resolve();
      }
    });
  }).then(() => {
    if (credsCmds[npmCommand]) {
      return credsCmds[npmCommand](npmArgv, creds, registry);
    } else {
      throw new Error(`invalid command: ${npmCommand}`);
    }
  });
}

async function adduserByLeagcy(userInfo, registry, scope, self) {
  return loadConfig().then(() => adduserLegacy(userInfo, registry, scope, self));
}

async function adduserBySso(registry, scope, cb, ssoType, self) {
  return loadConfig().then(() => adduserSso(registry, scope, cb, ssoType, self));
}

function loadConfig() {
  const conf = nopt(types, shorthands, [], 0);
  return new Promise((resolve, reject) => {
    npm.load(conf, function(er) {
      if (er) {
        reject(er);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  adduserByLeagcy,
  adduserBySso,
  runCmd,
  runCmdWithCreds,
};
