const RegisterUser = require('../RegisterUser')

describe('a RegisterUser entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'chloe',
      password: 'himitsu'
    }

    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      username: 123,
      fullname: true,
      password: 'secret'
    }

    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw error when username contains more than 50 character', () => {
    const payload = {
      username: 'chloepawpuaizeuwakuwakucomuchomuchototemokhawaaaaiipawapua',
      fullname: 'Chloe Pawapua',
      password: 'secret'
    }

    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.USERNAME_LIMIT_CHAR')
  })

  it('should throw error when username contains restricted character', () => {
    const payload = {
      username: 'i like chloe',
      fullname: 'Chloe Pawapua',
      password: 'secret'
    }

    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')
  })

  it('should create registerUser object correctly', () => {
    const payload = {
      username: 'chloepawapua',
      fullname: 'Chloe Pawapua',
      password: 'secret'
    }

    const registerUser = new RegisterUser(payload)

    expect(registerUser).toBeInstanceOf(RegisterUser)
    expect(registerUser.username).toEqual(payload.username)
    expect(registerUser.fullname).toEqual(payload.fullname)
    expect(registerUser.password).toEqual(payload.password)
  })
})
