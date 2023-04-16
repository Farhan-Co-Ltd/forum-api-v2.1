const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
  })

  let globalUserAccessToken = ''
  let threadId = ''

  beforeEach(async () => {
    const requestUserPayload = { username: 'chloe', password: 'himitsu', fullname: 'Chloe Pawapua' }
    const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
    const server = await createServer(container)

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestUserPayload
    })

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: requestUserPayload.username,
        password: requestUserPayload.password
      }
    })

    const { data: { accessToken } } = JSON.parse(loginResponse.payload)
    globalUserAccessToken = accessToken
    const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: userAccessToken
    })

    const { data: { addedThread } } = JSON.parse(addThreadResponse.payload)
    threadId = addedThread.id
  })

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request with invalid authorization token', async () => {
      const requestCommentPayload = { content: 'Sangat Baik' }
      const invalidUserAccesToken = { Authorization: 'machigaiAccess-token' }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: invalidUserAccesToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread is not found', async () => {
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads/invalid-threadId/comments',
        payload: requestCommentPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      const requestInvalidCommentPayload = {}
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestInvalidCommentPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('gagal menambahkan komentar, property tidak lengkap')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestInvalidCommentPayload = { content: true }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestInvalidCommentPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('gagal menambahkan komentar, tipe data tidak sesuai')
    })

    it('should response 201 when add new comment', async () => {
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()

      const { addedComment } = responseJson.data
      expect(addedComment.id && addedComment.content && addedComment.owner).toBeDefined()
      expect(addedComment.id && addedComment.content && addedComment.owner).not.toEqual('')
      expect(typeof addedComment.id && typeof addedComment.content && typeof addedComment.owner).toEqual('string')
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request with invalid authorization token', async () => {
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const invalidUserAccesToken = { Authorization: 'machigaiAccess-token' }
      const server = await createServer(container)

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: invalidUserAccesToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread is not found', async () => {
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/machigaiThreadId/comments/${commentId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 404 when comment is not found', async () => {
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/machigaiCommentId`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 403 when owner didnt have to access the comment', async () => {
      const requestUserPayload = { username: 'sakamata', password: 'himitsu dayo', fullname: 'Sakamata Chloe' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUserPayload
      })

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password
        }
      })
      const { data } = JSON.parse(loginResponse.payload)
      const anotherUserToken = data.accessToken
      const anotherUserAccessToken = { Authorization: `Bearer ${anotherUserToken}` }
      const requestCommentPayload = { content: 'Sangat Baik' }

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: anotherUserAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('anda tidak memiliki akses pada komentar terpilih')
    })

    it('should response 200 when delete comment with correct', async () => {
      const requestUserPayload = { username: 'sakamata', password: 'himitsu dayo', fullname: 'Sakamata Chloe' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const server = await createServer(container)

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUserPayload
      })

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password
        }
      })
      const { data } = JSON.parse(loginResponse.payload)
      const anotherUserToken = data.accessToken
      const anotherUserAccessToken = { Authorization: `Bearer ${anotherUserToken}` }

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: anotherUserAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: anotherUserAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})
