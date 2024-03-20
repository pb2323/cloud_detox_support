// @ts-nocheck
const DeviceAllocatorFactory = require('./base');
const CloudAndroidAllocDriver = require('../drivers/android/cloud/CloudAndroidAllocDriver');

class Noop extends DeviceAllocatorFactory {
    _createDriver() {
      return new CloudAndroidAllocDriver();
    }
}
  
module.exports = {
  Noop
};