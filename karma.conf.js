process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [require('./package.json').browser, './test/browser.test.js'],
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_ERROR,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 30000,
    concurrency: 1,
  })
}
