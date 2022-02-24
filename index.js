const core = require('@actions/core');
const fetch = require('node-fetch');

const cloudwaysApiUrl = 'https://api.cloudways.com/api/v1';

const supportedEndpoints = {
  varnish: {
    endpoint: '/service/varnish',
    params: [
      'action' // Possible commands are enable, disable, purge
    ]
  },
  service: {
    endpoint: '/service/state',
    params: [
      'service', // Possible values are mysql, apache2, nginx, memcached, varnish, redis-server, php5-fpm, elasticsearch and supervisor
      'state' // Possible values are start, stop, restart
    ]
  },
  cdn_purge: {
    endpoint: '/app/cdn/purge',
    params: [
      'app_id'
    ]
  }
}

// Get oAuth token from Cloudways API
async function getOauthToken() {
  const body = {
    email: core.getInput('email'),
    api_key: core.getInput('api-key')
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await fetch(`${ cloudwaysApiUrl }/oauth/access_token`, options).then(res => res.json());
}

// Generate options object including accessToken
function optionsWithAuth(body, accessToken) {
  return {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ accessToken }`
    }
  }
}

async function command(endpointConfig, params, accessToken) {
  const endpoint = endpointConfig.endpoint;
  const body = {
    server_id: core.getInput('server-id')
  };

  for (var parameter of endpointConfig.params) {
    body[parameter] = params.shift();
  }

  const options = optionsWithAuth(body, accessToken);

  return await fetch(cloudwaysApiUrl + endpoint, options).then(response => {

    return response.json().then(data => {
      core.info(JSON.stringify(data));
      return {
        ok: response.ok,
        code: response.status,
        body: data
      }
    });
  });
}

function validateParameters(endpointConfig, params) {
  return Object.keys(endpointConfig).length == params.length;
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const operationArgs = core.getInput('operation').split('.');
    const operation = operationArgs.shift();
    const endpointConfig = supportedEndpoints[operation];
    if (!endpointConfig) throw new Error(`Cloudways API operation '${operation}' not understood`);
    core.info(`Found Cloudways API operation: '${operation}'`);

    const paramsValid = validateParameters(endpointConfig.params, operationArgs);
    if (!paramsValid) throw new Error('Operation parameters not understood');

    const token = await getOauthToken();

    if (token.error) {
      throw new Error(token.error_description);
    }

    if (!token.access_token || token.access_token.legnth == 0) {
      throw new Error('Unable to retrieve access token from Cloudways.');
    }

    core.info('Successfully authenticated with Cloudways API');

    await command(endpointConfig, operationArgs, token.access_token).then(response => {
      if (!response.ok) {
        throw new Error(response.body.error_description);
      }

      core.info(`Success! Received response from Cloudways: ${ response.body }`);
      core.setOutput('success', true);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
