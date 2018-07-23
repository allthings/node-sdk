// tslint:disable:no-expression-statement

describe('Logger', () => {
  it('should log when there is a subscription', async () => {
    const testLogString = 'Test 123'

    jest.resetModules()
    jest.resetAllMocks()

    process.env.DEBUG = 'Foobar 1, Foobar 2' // tslint:disable-line no-object-mutation

    const makeLogger = require('./logger').default
    const logger = makeLogger('Foobar 1')

    const spy = jest
      .spyOn(console, 'log')
      .mockImplementationOnce(
        (...log) => !!expect(log).toEqual(['Foobar 1:', testLogString]),
      )

    logger.log(testLogString)

    expect(spy).toHaveBeenCalled()
  })

  it('should not log when there is no subscription', async () => {
    const testLogString = 'Test 456'

    jest.resetModules()
    jest.resetAllMocks()

    // tslint:disable-next-line no-delete no-object-mutation
    delete process.env.DEBUG

    const makeLogger = require('./logger').default
    const logger = makeLogger('Foobar 2')

    const spy = jest.spyOn(console, 'log')
    logger.log(testLogString)

    expect(spy).toHaveBeenCalledTimes(0)
  })
})
