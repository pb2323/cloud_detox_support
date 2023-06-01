function create() {
  console.log('tag: Value of DETOX_CONFIG_SNAPSHOT_PATH from create() of index.js', process.env.DETOX_CONFIG_SNAPSHOT_PATH);
  console.log('tag: Value of NEW_CONFIG_PATH from create() of index.js', process.env.NEW_CONFIG_PATH);

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
