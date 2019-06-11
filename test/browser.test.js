describe('browser test suite', () => {
  it('has `restClient` method exported on allthings global', () => {
    expect(window.allthings.restClient).toEqual(jasmine.any(Function))
  })
})
