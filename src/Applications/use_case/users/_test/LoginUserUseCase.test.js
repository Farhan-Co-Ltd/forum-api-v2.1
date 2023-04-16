const UserRepository = require('../../../../Domains/users/UserRepository')
const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository')
const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager')
const PasswordHash = require('../../../security/PasswordHash')
const LoginUserUseCase = require('../LoginUserUseCase')
const NewAuth = require('../../../../Domains/authentications/entities/NewAuth')

describe('GetAuthenticationUseCase', () => {
  it('should orchestrating the get authentication action correctly', async () => {
    const useCasePayload = {
      username: 'chloe',
      password: 'himitsu'
    }
    const mockedAuthentication = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token'
    })
    const mockUserRepository = new UserRepository()
    const mockAuthenticationRepository = new AuthenticationRepository()
    const mockAuthenticationTokenManager = new AuthenticationTokenManager()
    const mockPasswordHash = new PasswordHash()

    mockUserRepository.getPasswordByUsername = jest.fn(() => Promise.resolve('encrypted_password'))
    mockPasswordHash.comparePassword = jest.fn(() => Promise.resolve())
    mockAuthenticationTokenManager.createAccessToken = jest.fn(() => Promise.resolve(mockedAuthentication.accessToken))
    mockAuthenticationTokenManager.createRefreshToken = jest.fn(() => Promise.resolve(mockedAuthentication.refreshToken))
    mockUserRepository.getIdByUsername = jest.fn(() => Promise.resolve('user-2005'))
    mockAuthenticationRepository.addToken = jest.fn(() => Promise.resolve())

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash
    })

    const actualAuthentication = await loginUserUseCase.execute(useCasePayload)

    expect(actualAuthentication).toEqual(new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token'
    }))
    expect(mockUserRepository.getPasswordByUsername)
      .toBeCalledWith('chloe')
    expect(mockPasswordHash.comparePassword)
      .toBeCalledWith('himitsu', 'encrypted_password')
    expect(mockUserRepository.getIdByUsername)
      .toBeCalledWith('chloe')
    expect(mockAuthenticationTokenManager.createAccessToken)
      .toBeCalledWith({ id: 'user-2005', username: 'chloe' })
    expect(mockAuthenticationTokenManager.createRefreshToken)
      .toBeCalledWith({ id: 'user-2005', username: 'chloe' })
    expect(mockAuthenticationRepository.addToken)
      .toBeCalledWith(mockedAuthentication.refreshToken)
  })
})
