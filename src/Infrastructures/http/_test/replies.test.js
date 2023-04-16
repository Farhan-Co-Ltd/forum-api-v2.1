const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await RepliesTableTestHelper.cleanTable()
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

  describe('when POST /threads/{threadId}/comments/{commentsId}/replies', () => {
    it('should response 401 when request with invalid authorization token', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const invalidUserAccessToken = { Authorization: 'machigaiAccess-token' }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: invalidUserAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread is not found', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/invalid-threadId/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 404 when comment is not found', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/invalid-commentId/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      const requestReplyPayload = {}
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('gagal menambahkan balasan, property tidak lengkap')
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestReplyPayload = { content: 123 }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('gagal menambahkan balasan, tipe data tidak sesuai')
    })

    it('should response 201 when add new reply', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply).toBeDefined()

      const { addedReply } = responseJson.data
      expect(addedReply.id && addedReply.content && addedReply.owner).toBeDefined()
      expect(addedReply.id && addedReply.content && addedReply.owner).not.toEqual('')
      expect(typeof addedReply.id && typeof addedReply.content && typeof addedReply.owner).toEqual('string')
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should reponse 401 when request with invalid authorization token', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const invalidUserAccessToken = { Authorization: 'machgaiAccces-token' }
      const server = await createServer(container)

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: invalidUserAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread is not found', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/invalid-threadId/comments/${commentId}/replies/${replyId}`,
        headers: userAccessToken
      })
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 404 when comment is not found', async () => {
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/invalid-commentId/replies/${replyId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('komentar tidak ditemukan')
    })

    it('should response 403 when owner didnt have access to the reply', async () => {
      const requestAnotherUserPayload = { username: 'sakamata', password: 'himitsu dayo', fullname: 'Sakamata Chloe' }
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestAnotherUserPayload
      })

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAnotherUserPayload.username,
          password: requestAnotherUserPayload.password
        }
      })
      const { data } = JSON.parse(loginResponse.payload)
      const anotherUserToken = data.accessToken
      const anotherUserAcessToken = { Authorization: `Bearer ${anotherUserToken}` }

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: anotherUserAcessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('anda tidak memiliki akses pada balasan terpilih')
    })

    it('should response 200 when delete reply correctly', async () => {
      const requestUserPayload = { username: 'sakamata', password: 'suparhimitsu', fullname: 'Sakamata Chloe' }
      const requestReplyPayload = { content: 'Apa Iya' }
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
      const userAccessToken = { Authorization: `Bearer ${anotherUserToken}` }

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})
