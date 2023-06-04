const fs = require('fs-extra');

const { DetoxInternalError } = require('../errors');
const SessionState = require('../ipc/SessionState');

const DetoxContext = require('./DetoxContext');
const symbols = require('./symbols');

// Protected symbols
const { $restoreSessionState, $sessionState, $worker } = DetoxContext.protected;

//#region Private symbols
const _ipcClient = Symbol('ipcClient');
//#endregion

class DetoxSecondaryContext extends DetoxContext {
  constructor() {
    super();

    /**
     * @private
     * @type {import('../ipc/IPCClient')}
     */
    this[_ipcClient] = null;
  }

  //#region Internal members
  async [symbols.reportTestResults](testResults) {
    if (this[_ipcClient]) {
      await this[_ipcClient].reportTestResults(testResults);
    } else {
      throw new DetoxInternalError('Detected an attempt to report failed tests using a non-initialized context.');
    }
  }

  async [symbols.resolveConfig]() {
    return this[symbols.config];
  }

  /** @override */
  async [symbols.init](opts = {}) {
    const IPCClient = require('../ipc/IPCClient');

    this[_ipcClient] = new IPCClient({
      id: `secondary-${process.pid}`,
      sessionState: this[$sessionState],
      logger: this[symbols.logger],
    });

    await this[_ipcClient].init();

    if (opts.workerId !== null) {
      await this[symbols.installWorker](opts);
    }
  }

  /** @override */
  async [symbols.cleanup]() {
    try {
      if (this[$worker]) {
        await this[symbols.uninstallWorker]();
      }
    } finally {
      if (this[_ipcClient]) {
        await this[_ipcClient].dispose();
        this[_ipcClient] = null;
      }
    }
  }

  /** @override */
  async [symbols.installWorker](opts = {}) {
    const workerId = opts.workerId || 'worker';
    await this[_ipcClient].registerWorker(workerId);
    await super[symbols.installWorker]({ ...opts, workerId });
  }
  //#endregion

  //#region Protected members
  /**
   * @protected
   * @override
   * @return {SessionState}
   */
  [$restoreSessionState]() {
    console.log('Tag:secondary context env variables while restoring session state', process.env);
    let DETOX_CONFIG_SNAPSHOT_PATH = process.env.NEW_CONFIG_PATH;
    console.log('Tag: resetting process env variable for next session');
    process.env = JSON.parse(JSON.stringify(process.env));

    let sessionDetailsFilePath = 'session.json';
    let sessionDetails = fs.readFileSync(sessionDetailsFilePath);
    console.log('Tag: content of session.json temp file from secondary context', SessionState.parse(sessionDetails));
    fs.unlink(sessionDetailsFilePath, (err) => {
      if (err) {
          throw err;
      }

      console.log("Delete Detox Session File successfully.");
    });

    return SessionState.parse(sessionDetails);
  }
  //#endregion
}

module.exports = DetoxSecondaryContext;
