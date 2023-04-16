const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper')
const pool = require('../../database/postgres/pool')
const AddedReply = require('../../../Domains/replies/entities/AddedReply')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await RepliesTableTestHelper.cleanTable()
  })

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'
      const userId = 'user-2005'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId })

      const newReply = {
        content: 'Apa Iya',
        owner: userId,
        commentId
      }

      const fakeIdGenerator = () => '2004'
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      const addedReply = await replyRepositoryPostgres.addReply(newReply)
      const replies = await RepliesTableTestHelper.findRepliesById('reply-2004')

      expect(addedReply).toStrictEqual(new AddedReply({
        id: `reply-${fakeIdGenerator()}`,
        content: 'Apa Iya',
        owner: 'user-2005'
      }))
      expect(replies).toHaveLength(1)
    })
  })

  describe('getRepliesByCommentId function', () => {
    it('should return empty array when replies not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const userId = 'user-2005'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId })

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId)

      expect(replies).toHaveLength(0)
    })

    it('should return array when replies correctly', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const createdAt = new Date().toISOString()

      const user = {
        id: 'user-2005',
        username: 'chloe',
        fullname: 'Chloe Pawapua'
      }

      const thread = {
        id: 'thread-2004',
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: user.id,
        date: createdAt
      }

      const comment = {
        id: 'comment-2004',
        threadId: thread.id,
        date: createdAt,
        content: 'Sangat Baik',
        owner: user.id
      }

      const reply = {
        id: 'reply-2004',
        commentId: 'comment-2004',
        date: createdAt,
        content: 'Apa Iya',
        owner: user.id
      }

      const expectedReplyDetails = {
        id: reply.id,
        username: user.username,
        date: reply.date,
        content: reply.content,
        is_delete: false
      }

      await UsersTableTestHelper.addUser({ ...user })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...comment })
      await RepliesTableTestHelper.addReply({ ...reply })

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(comment.id)

      expect(replies).toHaveLength(1)
      expect(replies[0]).toStrictEqual(expectedReplyDetails)
    })

    it('should return array of replies sorted form most past', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const firstUser = {
        id: 'user-2002',
        username: 'sakamata',
        fullname: 'Sakamata Chloe'
      }
      const secondUser = {
        id: 'user-2005',
        username: 'chloe',
        fullname: 'Chloe Pawapua'
      }
      const thread = {
        id: 'thread-2004',
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: secondUser.id,
        date: new Date('2023-03-21').toISOString()
      }
      const comment = {
        id: 'comment-2004',
        threadId: thread.id,
        date: new Date('2023-03-22').toISOString(),
        content: 'Sangat Baik',
        owner: firstUser.id
      }
      const firstUserReply = {
        id: 'reply-2002',
        content: 'Apa Iya',
        commentId: comment.id,
        owner: firstUser.id,
        date: new Date('2023-03-23')
      }
      const secondUserReply = {
        id: 'reply-2004',
        content: 'Iyah',
        commentId: comment.id,
        owner: secondUser.id,
        date: new Date().toISOString()
      }

      await UsersTableTestHelper.addUser({ ...firstUser })
      await UsersTableTestHelper.addUser({ ...secondUser })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...comment })
      await RepliesTableTestHelper.addReply({ ...firstUserReply })
      await RepliesTableTestHelper.addReply({ ...secondUserReply })

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(comment.id)

      const firstUserReplyDate = new Date(replies[0].date)
      const secondUserReplyDate = new Date(replies[1].date)

      expect(replies).toHaveLength(2)
      expect(firstUserReplyDate.getTime()).toBeLessThan(secondUserReplyDate.getTime())
    })

    it('should return array of replies correctly and when reply has been deleted', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const createdAt = new Date().toISOString()
      const updatedAt = createdAt
      const user = {
        id: 'user-2005',
        username: 'chloe',
        fullname: 'Chloe Pawapua'
      }
      const thread = {
        id: 'thread-2004',
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: user.id,
        date: createdAt
      }
      const comment = {
        id: 'comment-2004',
        threadId: thread.id,
        date: createdAt,
        content: 'Sangat Baik',
        owner: user.id
      }
      const reply = {
        id: 'reply-2004',
        commentId: comment.id,
        date: createdAt,
        content: 'Apa Iya',
        owner: user.id
      }

      const expectedReplyDetails = {
        id: reply.id,
        username: user.username,
        date: updatedAt,
        content: reply.content,
        is_delete: true
      }

      await UsersTableTestHelper.addUser({ ...user })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...comment })
      await RepliesTableTestHelper.addReply({ ...reply })
      await replyRepositoryPostgres.deleteReply(reply.id)

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(comment.id)

      expect(replies).toHaveLength(1)
      expect(replies[0]).toStrictEqual(expectedReplyDetails)
    })
  })

  describe('checkAvailabilityReply functions', () => {
    it('should throw NotFoundError when reply unavailable', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const replyId = 'machigai-repulay'

      expect(replyRepositoryPostgres.checkAvailabilityReply(replyId))
        .rejects
        .toThrow(NotFoundError)
    })

    it('should not throw error NotFoundError when reply available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const userId = 'user-2005'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'
      const replyId = 'reply-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId })

      expect(replyRepositoryPostgres.checkAvailabilityReply(replyId))
        .resolves
        .not.toThrow(NotFoundError)
    })
  })

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError when owner didnt have access to the reply', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const firstUser = 'user-2004'
      const secondUser = 'user-2002'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'
      const replyId = 'reply-2004'

      await UsersTableTestHelper.addUser({ id: firstUser })
      await UsersTableTestHelper.addUser({ id: secondUser, username: 'sakamata' })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: firstUser })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: secondUser })
      await RepliesTableTestHelper.addReply({ id: replyId, threadId, owner: secondUser })

      const owner = firstUser
      expect(replyRepositoryPostgres.verifyReplyAccess({ replyId, owner }))
        .rejects
        .toThrow(AuthorizationError)
    })

    it('shouldnt throw AuthorizationError when owner have access to the reply', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const userId = 'user-2004'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'
      const replyId = 'reply-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId })

      const owner = userId
      expect(replyRepositoryPostgres.verifyReplyAccess({ replyId, owner }))
        .resolves
        .not.toThrow(AuthorizationError)
    })
  })

  describe('deleteReply function', () => {
    it('should update is_delete and content from comment', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool)
      const userId = 'user-2005'
      const threadId = 'thread-2004'
      const comment = {
        id: 'comment-2004',
        content: 'Sangat Baik',
        threadId,
        owner: userId
      }
      const reply = {
        id: 'reply-2004',
        content: 'Apa Iya',
        commentId: 'comment-2004',
        owner: userId
      }
      const expectedDeleteReply = {
        id: reply.id,
        content: reply.content,
        is_delete: true
      }

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment(comment)
      await RepliesTableTestHelper.addReply(reply)

      const repliesBeforeDelete = await RepliesTableTestHelper.findRepliesById(reply.id)
      const replyBeforeDelete = repliesBeforeDelete[0]

      await replyRepositoryPostgres.deleteReply(reply.id)

      const repliesAfterDelete = await RepliesTableTestHelper.findRepliesById(reply.id)
      const replyAfterDelete = repliesAfterDelete[0]

      expect(replyBeforeDelete.is_delete).toEqual(false)
      expect(replyAfterDelete.is_delete).toEqual(expectedDeleteReply.is_delete)
    })
  })
})
