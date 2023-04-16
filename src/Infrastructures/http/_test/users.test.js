const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/users endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
  })

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = {
        username: 'chloe',
        password: 'himitsu',
        fullname: 'Chloe Pawapua'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedUser).toBeDefined()
    })

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        fullname: 'Chloe Pawapua',
        password: 'himitsu'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena property yang dibutuhkan tidak ada')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        username: 'chloe',
        password: 'himitsu',
        fullname: ['Chloe Pawapua']
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai')
    })

    it('should response 400 when request username more than 50 character', async () => {
      const requestPayload = {
        username: 'chloepawpuaizeuwakuwakucomuchomuchototemokhawaaaaiipawapua',
        password: 'himitsu',
        fullname: 'Chloe Pawapua'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit')
    })

    it('should response 400 when request username contain restricted character', async () => {
      const requestPayload = {
        username: 'ch loe',
        password: 'himitsu',
        fullname: 'Chloe Pawapua'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang')
    })

    it('should response 400 when request username unavailable', async () => {
      await UsersTableTestHelper.addUser({ username: 'chloe' })
      const requestPayload = {
        username: 'chloe',
        password: 'himitsu',
        fullname: 'Chloe Pawapua'
      }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('username tidak tersedia')
    })

    it('should handle server error correctly', async () => {
      const requestPayload = {
        username: 'chloe',
        password: 'himitsu',
        fullname: 'Chloe Pawapua'
      }
      const server = await createServer({})

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(500)
      expect(responseJson.status).toEqual('error')
      expect(responseJson.message).toEqual('terjadi kegagalan pada server kami')
    })
  })
})
