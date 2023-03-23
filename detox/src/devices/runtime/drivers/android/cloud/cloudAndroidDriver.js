/* eslint @typescript-eslint/no-unused-vars: ["error", { "args": "none" }] */
// @ts-nocheck
const _ = require('lodash');

const DetoxApi = require('../../../../../android/espressoapi/Detox');
const EspressoDetoxApi = require('../../../../../android/espressoapi/EspressoDetox');
const UiDeviceProxy = require('../../../../../android/espressoapi/UiDeviceProxy');
const logger = require('../../../../../utils/logger');
const DeviceDriverBase = require('../../DeviceDriverBase');

const log = logger.child({ cat: 'device' });

/**
 * @typedef { DeviceDriverDeps } CloudAndroidDriverDeps
 * @property invocationManager { InvocationManager }
 */

class CloudAndroidDriver extends DeviceDriverBase {
  /**
   * @param deps { CloudAndroidDriverDeps }
   * @param props { CloudAndroidDriverProps }
   */
  constructor(deps) {
    super(deps);

    this.invocationManager = deps.invocationManager;
    this.instrumentation = false;

    this.uiDevice = new UiDeviceProxy(this.invocationManager).getUIDevice();
  }

  async launchApp(bundleId, launchArgs, languageAndLocale) {
    return await this._handleLaunchApp({
      manually: false,
      bundleId,
      launchArgs,
      languageAndLocale,
    });
  }

  async _handleLaunchApp({ manually, bundleId, launchArgs }) {
    const response = await this._launchApp( bundleId, launchArgs);
    const pid = _.get(response, 'response.success');
    return pid;
  }

  async deliverPayload(params) {
    if (params.delayPayload) {
      return;
    }

    const { url } = params;
    if (url) {
      await this._startActivityWithUrl(url);
    }
  }

  async waitUntilReady() {
    try {
      await super.waitUntilReady();
    } catch (e) {
      log.warn({ error: e }, 'An error occurred while waiting for the app to become ready. Waiting for disconnection...');
      await this.client.waitUntilDisconnected();
      log.warn('The app disconnected.');
      throw e;
    }
  }

  async pressBack() {
    await this.uiDevice.pressBack();
  }

  async sendToHome(params) {
    await this.uiDevice.pressHome();
  }

  async terminate(bundleId) {
    return await this._terminateInstrumentation();
  }

  async cleanup(bundleId) {
    await super.cleanup(bundleId);
  }

  getPlatform() {
    return 'android';
  }

  getUiDevice() {
    return this.uiDevice;
  }

  async enableSynchronization() {
    await this.invocationManager.execute(EspressoDetoxApi.setSynchronization(true));
  }

  async disableSynchronization() {
    await this.invocationManager.execute(EspressoDetoxApi.setSynchronization(false));
  }

  async takeScreenshot(screenshotName) {

    return '';
  }

  async setOrientation(orientation) {
    const orientationMapping = {
      landscape: 1, // top at left side landscape
      portrait: 0 // non-reversed portrait.
    };

    const call = EspressoDetoxApi.changeOrientation(orientationMapping[orientation]);
    await this.invocationManager.execute(call);
  }

  async _launchApp( bundleId, launchArgs) {
    if (!this.instrumentation) {
      const response = await this.invocationManager.executeCloudPlatform({
        'method': 'launchApp',
        'args': {
          'launchArgs': launchArgs
        }
      });
      const status = _.get(response, 'response.success');
      this.instrumentation = status && status.toString() == 'true';
    } else if (launchArgs.detoxURLOverride) {
      await this._startActivityWithUrl(launchArgs.detoxURLOverride);
    } else {
      await this._resumeMainActivity();
    }
  }

  async _terminateInstrumentation(bundleId) {
    const response = await this.invocationManager.executeCloudPlatform({
      'method': 'terminateApp',
      'args': {}
    });
    const status = _.get(response, 'response.success');
    this.instrumentation = !(status && status.toString() == 'true');
  }

  _startActivityWithUrl(url) {
    return this.invocationManager.execute(DetoxApi.startActivityFromUrl(url));
  }

  _resumeMainActivity() {
    return this.invocationManager.execute(DetoxApi.launchMainActivity());
  }
}

module.exports = CloudAndroidDriver;
