const funpermaproxy = require('funpermaproxy');

const symbols = require('./symbols');

class DetoxInternalsFacade {
  /**
   * @param context
   */
  constructor(context) {
    this.config = context[symbols.config];
    console.log('tag: Value of DETOX_CONFIG_SNAPSHOT_PATH from constructor of DetoxInternalsFacade', process.env.DETOX_CONFIG_SNAPSHOT_PATH)
    console.log('tag: Value of NEW_CONFIG_PATH from constructor of DetoxInternalsFacade', process.env.NEW_CONFIG_PATH)
    this.getStatus = context[symbols.getStatus];
    this.init = context[symbols.init];
    this.cleanup = context[symbols.cleanup];
    this.log = context[symbols.logger];
    this.installWorker = context[symbols.installWorker];
    this.uninstallWorker = context[symbols.uninstallWorker];
    this.onHookFailure = context[symbols.onHookFailure];
    this.onRunDescribeFinish = context[symbols.onRunDescribeFinish];
    this.onRunDescribeStart = context[symbols.onRunDescribeStart];
    this.onTestDone = context[symbols.onTestDone];
    this.onTestFnFailure = context[symbols.onTestFnFailure];
    this.onTestStart = context[symbols.onTestStart];
    this.reportTestResults = context[symbols.reportTestResults];
    this.resolveConfig = context[symbols.resolveConfig];
    this.session = context[symbols.session];
    this.tracing = context[symbols.tracing];
    this.worker = funpermaproxy(() => context[symbols.worker]);
  }
}

module.exports = DetoxInternalsFacade;
