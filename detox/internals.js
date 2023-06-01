function create() {
  console.log('tag: Value of DETOX_CONFIG_SNAPSHOT_PATH from create() of internals', process.env.DETOX_CONFIG_SNAPSHOT_PATH);
  console.log('tag: Value of NEW_CONFIG_PATH from create() of internals', process.env.NEW_CONFIG_PATH);
  const context = require('./index');
  const DetoxInternalsFacade = require('./src/realms/DetoxInternalsFacade');

  return new DetoxInternalsFacade(context);
}

/** @type {DetoxInternals.Facade} */
module.exports = global['__detox__']
  ? global['__detox__'].internalsApi
  : create();
