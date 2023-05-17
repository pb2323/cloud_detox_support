function create() {
  console.log('tag: Value of DETOX_CONFIG_SNAPSHOT_PATH env variable from index create method', process.env.DETOX_CONFIG_SNAPSHOT_PATH);
  if (process.env.DETOX_CONFIG_SNAPSHOT_PATH) {
    return require('./src/realms/secondary');
  } else {
    return require('./src/realms/primary');
  }
}

/** @type {Detox.DetoxExportWrapper} */
module.exports = global['__detox__']
  ? global['__detox__'].clientApi
  : create();
