const ClientError = require('../ClientError')
const NotFoundError = require('../NotFoundError')

describe('NotFoundError', () => {
  it('should create a NotFoundError correctly', () => {
    const notFoundError = new NotFoundError('not found!')

    expect(notFoundError).toBeInstanceOf(NotFoundError)
    expect(notFoundError).toBeInstanceOf(ClientError)
    expect(notFoundError).toBeInstanceOf(Error)
    expect(notFoundError.statusCode).toEqual(404)
    expect(notFoundError.message).toEqual('not found!')
    expect(notFoundError.name).toEqual('NotFoundError')
  })
})
