'use strict'

/**
 * @module @yoda/battery
 * @description provide the battery state management.
 */

/**
 * @returns {boolean} true if device has battery support enabled
 */
function isBatterySupported () {
  return require('@yoda/manifest').isCapabilityEnabled('battery')
}

/**
 *
 * @param {object} [options]
 * @param {number} [options.timeout]
 * @returns {object} battery info
 */
function getBatteryInfo (options) {
  return require('@yoda/flora/disposable').once('battery.info', options)
    .then(msg => {
      var data
      try {
        data = JSON.parse(msg[0])
      } catch (err) {
        throw new Error('Unparsable data received from battery.info')
      }
      return data
    })
}

module.exports.isBatterySupported = isBatterySupported
module.exports.getBatteryInfo = getBatteryInfo
