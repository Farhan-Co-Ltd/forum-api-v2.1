const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const LikeCommentTableTestHelper = require('../../../../tests/LikeCommentTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await LikeCommentTableTestHelper.cleanTable()
  })

  let globalUserAccessToken = ''
  let threadId = ''
  let commentId = ''

  beforeEach(async () => {
    const requestUserPayload = { username: 'chloe', password: 'himitsu', fullname: 'Chloe Pawapua' }
    const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
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

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestCommentPayload,
      headers: userAccessToken
    })

    const { data: { addedComment } } = JSON.parse(addCommentResponse.payload)
    commentId = addedComment.id
  })

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request with invalid authorization token', async () => {
      const invalidUserAccesToken = { Authorization: 'machigaiAccess-token' }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: invalidUserAccesToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread is not found', async () => {
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/invalid-threadId/comments/${commentId}/likes`,
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
        method: 'PUT',
        url: `/threads/${threadId}/comments/invalid-commentId/likes`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 200 when like comment correctly', async () => {
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 200 when another user like comment', async () => {
      const requestUserPayload = { username: 'sakamata', password: 'himitsu dayo', fullname: 'Sakamata Chloe' }
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

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: anotherUserAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})
