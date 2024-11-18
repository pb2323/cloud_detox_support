const _ = require('lodash');

const isValidWebsocketURL = require('../utils/isValidWebsocketURL');
const log = require('../utils/logger').child({ cat: 'config' });

/**
 * @param {{
 *  cliConfig: Record<string, any>;
 *  globalConfig: Detox.DetoxConfig;
 *  localConfig: Detox.DetoxConfiguration;
 *  errorComposer: import('../errors/DetoxConfigErrorComposer');
 *  isCloudSession: Boolean
 * }} options
 */
async function composeSessionConfig(options) {
  const { errorComposer, cliConfig, globalConfig, localConfig, isCloudSession } = options;
  const cloudSupportedCaps = ['server', 'name', 'project', 'build', 'local', 'forceLocal', 'localIdentifier', 'networkLogsIncludeHosts', 'networkLogsExcludeHosts'];
  const session = {
    ...globalConfig.session,
    ...localConfig.session,
  };

  if (session.server != null) {
    const value = session.server;
    if (typeof value !== 'string' || !isValidWebsocketURL(value)) {
      throw errorComposer.invalidServerProperty();
    }
  }
  else if (isCloudSession) {
    throw errorComposer.invalidSessionProperty('server');
  }

  if (session.sessionId != null) {
    const value = session.sessionId;
    if (typeof value !== 'string' || value.length === 0) {
      throw errorComposer.invalidSessionIdProperty();
    }
  }

  if (session.debugSynchronization != null) {
    const value = session.debugSynchronization;
    if (typeof value !== 'number' || value < 0) {
      throw errorComposer.invalidDebugSynchronizationProperty();
    }
  }

  if (Number.parseInt(cliConfig.debugSynchronization, 10) >= 0) {
    session.debugSynchronization = +cliConfig.debugSynchronization;
  }

  if (isCloudSession) {
    if (session.build != null) {
      const value = session.build;
      if (typeof value !== 'string' || value.length === 0) {
        throw errorComposer.invalidCloudSessionProperty('build');
      }
    }
    if (session.project != null) {
      const value = session.project;
      if (typeof value !== 'string' || value.length === 0) {
        throw errorComposer.invalidCloudSessionProperty('project');
      }
    }
    if (session.name != null) {
      const value = session.name;
      if (typeof value !== 'string' || value.length === 0) {
        throw errorComposer.invalidCloudSessionProperty('name');
      }
    }
    if (session.local != null) {
      const value = session.local;
      if (typeof value !== 'boolean') {
        throw errorComposer.invalidCloudSessionProperty('local', 'boolean');
      }
    }
    if (session.forceLocal != null) {
      const value = session.forceLocal;
      if (typeof value !== 'boolean') {
        throw errorComposer.invalidCloudSessionProperty('forceLocal', 'boolean');
      }
    }
    if (session.localIdentifier != null) {
      const value = session.localIdentifier;
      if (typeof value !== 'string' || value.length === 0) {
        throw errorComposer.invalidCloudSessionProperty('localIdentifier');
      }
    }
    if (session.networkLogsIncludeHosts != null) {
      const value = session.networkLogsIncludeHosts;
      if (!isValidNetworkHostsInput(value)) {
        throw errorComposer.invalidCloudSessionProperty('networkLogsIncludeHosts', 'string or array of non-empty strings');
      }
    }
    if (session.networkLogsExcludeHosts != null) {
      const value = session.networkLogsExcludeHosts;
      if (!isValidNetworkHostsInput(value)) {
        throw errorComposer.invalidCloudSessionProperty('networkLogsExcludeHosts', 'string or array of non-empty strings');
      }
    }
    const ignoredCloudConfigParams = _.difference(Object.keys(session), cloudSupportedCaps);
    if (ignoredCloudConfigParams.length > 0)
      log.warn(`[SessionConfig] The properties ${ignoredCloudConfigParams.join(', ')} are not honoured for device type 'android.cloud'.`);
  }

  const result = {
    autoStart: !session.server,
    debugSynchronization: 10000,

    ...session,
  };
  // Are we supporting or ignoring debugSynchronization

  if (!result.server && !result.autoStart) {
    throw errorComposer.cannotSkipAutostartWithMissingServer();
  }

  return result;
}

function isValidNetworkHostsInput(value) {
  if (typeof value === 'string') {
    return value.length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0 && value.every(host => typeof host === 'string' && host.length > 0);
  }
  return false;
}

module.exports = composeSessionConfig;
