const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const RegisterUser = require('../../../Domains/users/entities/RegisterUser')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const pool = require('../../database/postgres/pool')
const UserRepositoryPostgres = require('../UserRepositoryPostgres')

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username not available', async () => {
      await UsersTableTestHelper.addUser({ username: 'chloe' })
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      await expect(userRepositoryPostgres.verifyAvailableUsername('chloe'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should not throw InvariantError when username available', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      await expect(userRepositoryPostgres.verifyAvailableUsername('chloe'))
        .resolves
        .not.toThrowError(InvariantError)
    })
  })

  describe('addUser function', () => {
    it('should persist register user', async () => {
      const registerUser = new RegisterUser({
        username: 'chloe',
        password: 'himitsu_password',
        fullname: 'Chloe Pawapua'
      })
      const fakeIdGenerator = () => '2005'
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator)

      await userRepositoryPostgres.addUser(registerUser)

      const users = await UsersTableTestHelper.findUsersById('user-2005')
      expect(users).toHaveLength(1)
    })

    it('should return registered correctly', async () => {
      const registerUser = new RegisterUser({
        username: 'chloe',
        password: 'himitsu_password',
        fullname: 'Chloe Pawapua'
      })
      const fakeIdGenerator = () => '2005'
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator)

      const registeredUser = await userRepositoryPostgres.addUser(registerUser)

      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: `user-${fakeIdGenerator()}`,
        username: 'chloe',
        fullname: 'Chloe Pawapua'
      }))
    })
  })

  describe('getPasswordByUsername', () => {
    it('should throw InvariantError when user not found', () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      return expect(userRepositoryPostgres.getPasswordByUsername('chloe'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should return username password when user is found', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({
        username: 'chloe',
        password: 'himitsu'
      })

      const password = await userRepositoryPostgres.getPasswordByUsername('chloe')
      expect(password).toBe('himitsu')
    })
  })

  describe('getIdByUsername', () => {
    it('should throw InvariantError when user not found', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      await expect(userRepositoryPostgres.getIdByUsername('chloe'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should return user id correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-2005', username: 'chloe' })
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      const userId = await userRepositoryPostgres.getIdByUsername('chloe')
      expect(userId).toEqual('user-2005')
    })
  })
})
