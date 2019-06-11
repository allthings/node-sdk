process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [require('./package.json').browser, './test/browser.test.js'],
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_DEBUG,
    browsers: ['HeadlessChrome'],
    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-setuid-sandbox',
        ],
      },
    },
    singleRun: true,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 30000,
    concurrency: 1,
  })
}
