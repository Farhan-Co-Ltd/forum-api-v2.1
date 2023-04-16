const RegisteredUser = require('../RegisteredUser')

describe('a RegisteredUser entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'pawapua',
      fullname: 'Chloe Pawapua'
    }

    expect(() => new RegisteredUser(payload)).toThrowError('REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: {},
      username: 123,
      fullname: true
    }

    expect(() => new RegisteredUser(payload)).toThrowError('REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create registeredUser object correctly', () => {
    const payload = {
      id: 'user-2004',
      username: 'chloepawapua',
      fullname: 'Chloe Pawapua'
    }

    const registeredUser = new RegisteredUser(payload)

    expect(registeredUser).toBeInstanceOf(RegisteredUser)
    expect(registeredUser.id).toEqual(payload.id)
    expect(registeredUser.username).toEqual(payload.username)
    expect(registeredUser.fullname).toEqual(payload.fullname)
  })
})
