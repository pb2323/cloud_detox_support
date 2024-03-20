/**
 * @typedef {import('../../AllocationDriverBase').AllocationDriverBase} AllocationDriverBase
 * @typedef {import('../../../../common/drivers/android/cookies').AndroidDeviceCookie} AndroidDeviceCookie
 */

/**
 * @implements {AllocationDriverBase}
 */
class CloudAndroidAllocDriver {
    constructor() {
        this._idlePromise = Promise.resolve();
    }

    async init() {
        return this._idlePromise;
    }

    /**
     * @param deviceConfig
     * @return {Promise<AndroidDeviceCookie>}
     */
    async allocate(deviceConfig) {
      return { id: null, adbName:null };
    }

    /**
     * @param {AndroidDeviceCookie} deviceCookie
     * @returns {Promise<void>}
     */
    async postAllocate(deviceCookie) {
        return this._idlePromise
    }

    /**
     * @param cookie { AndroidDeviceCookie }
     * @return {Promise<void>}
     */
    async free(cookie) {
      return this._idlePromise
    }
  }

  module.exports = CloudAndroidAllocDriver;
