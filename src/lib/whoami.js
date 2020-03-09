'use strict';

const npmConfig = require('npm/lib/config/figgy-config.js');
const fetch = require('libnpm/fetch');
const figgyPudding = require('figgy-pudding');
const output = require('npm/lib/utils/output.js');

const WhoamiConfig = figgyPudding({
  json: {},
  registry: {},
});

module.exports = whoami;

whoami.usage = 'npm whoami [--registry <registry>]\n(just prints username according to given registry)';

async function whoami(args, creds = {}, inputRegistry) {
  if (!creds.token) throw new Error('a token shoud be specifed in creds');

  const opts = WhoamiConfig(npmConfig());
  const registry = inputRegistry || opts.registry;
  if (!registry) throw new Error('no default registry set');

  return Promise.resolve()
    .then(() => {
      const { username, token } = creds;

      if (username) {
        return Promise.resolve(username);
      } else if (token) {
        return fetch
          .json(
            '/-/whoami',
            opts.concat({
              registry,
              forceAuth: { token },
            }),
          )
          .then(({ username }) => {
            if (username) {
              return username;
            } else {
              throw Object.assign(new Error('Your auth token is no longer valid. Please log in again.'), {
                code: 'ENEEDAUTH',
              });
            }
          });
      } else {
        // At this point, if they have a credentials object, it doesn't have a
        // token or auth in it.  Probably just the default registry.
        throw Object.assign(new Error('This command requires you to be logged in.'), { code: 'ENEEDAUTH' });
      }
    })
    .then(username => {
      if (opts.json) {
        output(JSON.stringify(username));
      } else {
        output(username);
      }
      return username;
    });
}
