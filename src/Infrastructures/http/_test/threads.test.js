const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads endpoint', () => {
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

  beforeEach(async () => {
    const requestUserPayload = { username: 'chloe', password: 'himitsu', fullname: 'Chloe Pawapua' }
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
  })

  describe('when POST /threads', () => {
    it('should response 401 when request with invalid authorization token', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      const requestInvalidThreadPayload = { title: 'Pawapuan' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestInvalidThreadPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('gagal menambahkan thread, property tidak lengkap')
    })

    it('should reponse 400 when request payload not meet data type specification ', async () => {
      const requestInvalidThreadPayload = { title: true, body: {} }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestInvalidThreadPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('gagal menambahkan thread, tipe data tidak sesuai')
    })

    it('should response 201 and add new thread', async () => {
      const requestPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()

      const { addedThread } = responseJson.data
      expect(addedThread.id && addedThread.title && addedThread.owner).toBeDefined()
      expect(addedThread.id && addedThread.title && addedThread.owner).not.toEqual('')
      expect(typeof addedThread.id && typeof addedThread.title && typeof addedThread.owner).toEqual('string')
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const response = await server.inject({
        method: 'GET',
        url: '/threads/invalid-threadId',
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 200 and thread details correctly when thread available', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.id && thread.title && thread.body && thread.date && thread.username && thread.comments).toBeDefined()
      expect(thread.id && thread.title && thread.body && thread.date && thread.username).not.toEqual('')
      expect(typeof thread.id && typeof thread.title && typeof thread.body && typeof thread.date && typeof thread.username).toEqual('string')
      expect(thread.comments).toHaveLength(1)
    })

    it('should response 200 and thread details correctly if comment has been deleted', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.id && thread.title && thread.body && thread.date && thread.username && thread.comments).toBeDefined()
      expect(thread.id && thread.title && thread.body && thread.date && thread.username).not.toEqual('')
      expect(typeof thread.id && typeof thread.title && typeof thread.body && typeof thread.date && typeof thread.username).toEqual('string')
      expect(thread.comments).toHaveLength(1)
      expect(thread.comments[0].content).toEqual('**komentar telah dihapus**')
    })

    it('should response 200 and thread details correctly by sorted comment form most past', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestFirstCommentPayload = { content: 'Sangat Baik' }
      const requestSecondCommentPayload = { content: 'Anya Waku-Waku' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestFirstCommentPayload,
        headers: userAccessToken
      })

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestSecondCommentPayload,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          Authorization: `Bearer ${globalUserAccessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.comments).toBeDefined()
      expect(thread.comments).toHaveLength(2)

      const firstCommentDate = new Date(thread.comments[0].date)
      const secondCommentDate = new Date(thread.comments[1].date)
      expect(firstCommentDate.getTime()).toBeLessThan(secondCommentDate.getTime())
    })

    it('should response 200 and thread details correctly with reply', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.id && thread.title && thread.body && thread.date && thread.username && thread.comments).toBeDefined()
      expect(thread.id && thread.title && thread.body && thread.date && thread.username).not.toEqual('')
      expect(typeof thread.id && typeof thread.title && typeof thread.body && typeof thread.date && typeof thread.username).toEqual('string')
      expect(thread.comments).toHaveLength(1)
      expect(thread.comments[0].replies).toBeDefined()
      expect(thread.comments[0].replies).toHaveLength(1)
    })

    it('should response 200 and thread details correctly by sorted replies form most past', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const requestFirstReplyPayload = { content: 'Apa Iya' }
      const requestSecondReplyPayload = { content: 'Yaiyah masa iyaiya donk' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestFirstReplyPayload,
        headers: userAccessToken
      })

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestSecondReplyPayload,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.comments[0].replies).toBeDefined()
      expect(thread.comments[0].replies).toHaveLength(2)

      const firstReplyDate = new Date(thread.comments[0].replies[0].date)
      const secondReplyDate = new Date(thread.comments[0].replies[1].date)
      expect(firstReplyDate.getTime()).toBeLessThan(secondReplyDate.getTime())
    })

    it('should response 200 and thread details correcly if reply has been deleted', async () => {
      const requestThreadPayload = { title: 'Pawapuan', body: 'Deskripsi' }
      const requestCommentPayload = { content: 'Sangat Baik' }
      const requestReplyPayload = { content: 'Apa Iya' }
      const userAccessToken = { Authorization: `Bearer ${globalUserAccessToken}` }
      const server = await createServer(container)

      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: userAccessToken
      })
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload)
      const { data: { addedThread } } = addThreadResponseJson
      const threadId = addedThread.id

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: userAccessToken
      })
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload)
      const { data: { addedComment } } = addCommentResponseJson
      const commentId = addedComment.id

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: userAccessToken
      })
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload)
      const { data: { addedReply } } = addReplyResponseJson
      const replyId = addedReply.id

      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: userAccessToken
      })

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: userAccessToken
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()

      const { thread } = responseJson.data
      expect(thread.comments[0].replies).toBeDefined()
      expect(thread.comments[0].replies).toHaveLength(1)
      expect(thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**')
    })
  })
})
