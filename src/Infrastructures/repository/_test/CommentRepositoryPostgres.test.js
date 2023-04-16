const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const pool = require('../../database/postgres/pool')
const AddedComment = require('../../../Domains/comments/entities/AddedComment')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
  })

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      const userId = 'user-2002'
      const threadId = 'thread-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })

      const newComment = {
        content: 'Sangat Baik',
        owner: userId,
        threadId
      }

      const fakeIdGenerator = () => '2004'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)

      const addedComment = await commentRepositoryPostgres.addComment(newComment)
      const comments = await CommentsTableTestHelper.findCommentsById('comment-2004')

      expect(addedComment).toStrictEqual(new AddedComment({
        id: `comment-${fakeIdGenerator()}`,
        content: 'Sangat Baik',
        owner: 'user-2002'
      }))
      expect(comments).toHaveLength(1)
    })
  })

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const commentId = 'machigai-comento'

      expect(commentRepositoryPostgres.checkAvailabilityComment(commentId))
        .rejects
        .toThrow(NotFoundError)
    })

    it('shouldnt throw NotFoundError when comment available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const userId = 'user-2005'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      expect(commentRepositoryPostgres.checkAvailabilityComment(commentId))
        .resolves
        .not.toThrow(NotFoundError)
    })
  })

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when owner didnt have access to the comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const firstUser = 'user-2005'
      const secondUser = 'user-2002'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'

      await UsersTableTestHelper.addUser({ id: firstUser })
      await UsersTableTestHelper.addUser({ id: secondUser, username: 'sakamata' })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: firstUser })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: secondUser })

      const owner = firstUser
      expect(commentRepositoryPostgres.verifyCommentAccess({ commentId, owner }))
        .rejects
        .toThrow(AuthorizationError)
    })

    it('should not throw AuthorizationError when owner has access to the comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const firstUser = 'user-2005'
      const secondUser = 'user-2002'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'

      await UsersTableTestHelper.addUser({ id: firstUser })
      await UsersTableTestHelper.addUser({ id: secondUser, username: 'sakamata' })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: firstUser })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: firstUser })

      const owner = firstUser
      expect(commentRepositoryPostgres.verifyCommentAccess({ commentId, owner }))
        .resolves
        .not.toThrow(AuthorizationError)
    })
  })

  describe('deleteComment function', () => {
    it('should update isDelete status and content when comment has delete', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const userId = 'user-2005'
      const comment = {
        id: 'comment-2004',
        content: 'Sangat Baik',
        threadId: 'thread-2004',
        owner: userId
      }

      const expectedDeletedComment = {
        id: comment.id,
        content: comment.content,
        is_delete: true
      }

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: comment.threadId, owner: userId })
      await CommentsTableTestHelper.addComment(comment)

      const commentsBeforeDelete = await CommentsTableTestHelper.findCommentsById(comment.id)
      const commentBeforeDelete = commentsBeforeDelete[0]

      await commentRepositoryPostgres.deleteComment(comment.id)

      const commentsAfterDelete = await CommentsTableTestHelper.findCommentsById(comment.id)
      const commentAfterDelete = commentsAfterDelete[0]

      expect(commentBeforeDelete.is_delete).toEqual(false)
      expect(commentAfterDelete.is_delete).toEqual(expectedDeletedComment.is_delete)
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when comments not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const userId = 'user-2005'
      const threadId = 'thread-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId)

      expect(comments).toHaveLength(0)
    })

    it('should return array values when comments correctly', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const createdAt = new Date().toISOString()

      const user = {
        id: 'user-2002',
        username: 'sakamata',
        fullname: 'Sakamata Chloe'
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

      const expectedCommentDetails = {
        id: 'comment-2004',
        username: user.username,
        date: comment.date,
        content: comment.content,
        is_delete: false,
        replies: []
      }

      await UsersTableTestHelper.addUser({ ...user })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...comment })

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(thread.id)

      expect(comments).toHaveLength(1)
      expect(comments[0]).toStrictEqual(expectedCommentDetails)
    })

    it('should return array values when comments correctly and has delete', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const createdAt = new Date().toISOString()
      const updatedAt = createdAt

      const user = {
        id: 'user-2002',
        username: 'sakamata',
        fullname: 'Sakamata Chloe'
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
        owner: user.id,
        is_delete: true,
        replies: []
      }

      const expectedCommentDetails = {
        id: comment.id,
        username: user.username,
        date: updatedAt,
        content: comment.content,
        is_delete: true,
        replies: []
      }

      await UsersTableTestHelper.addUser({ ...user })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...comment })
      await commentRepositoryPostgres.deleteComment(comment.id)

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(thread.id)
      expect(comments).toHaveLength(1)
      expect(comments[0]).toStrictEqual((expectedCommentDetails))
    })

    it('should return array or list of comments sorted form most past', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool)
      const firstUser = {
        id: 'user-2002',
        username: 'sakamata',
        fullname: 'Sakamata Chloe'
      }
      const secondUser = {
        id: 'user-2004',
        username: 'gura',
        fullname: 'Gawr Gura'
      }
      const thread = {
        id: 'thread-2004',
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: firstUser.id,
        date: new Date().toISOString()
      }
      const firstUserComment = {
        id: 'comment-2002',
        content: 'Sangat Baik',
        threadId: thread.id,
        owner: firstUser.id,
        date: new Date('2023-03-24').toISOString()
      }
      const secondUserComent = {
        id: 'comment-2004',
        content: 'Cherry',
        threadId: thread.id,
        owner: secondUser.id,
        date: new Date().toISOString()
      }

      await UsersTableTestHelper.addUser({ ...firstUser })
      await UsersTableTestHelper.addUser({ ...secondUser })
      await ThreadsTableTestHelper.addThread({ ...thread })
      await CommentsTableTestHelper.addComment({ ...firstUserComment })
      await CommentsTableTestHelper.addComment({ ...secondUserComent })

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(thread.id)
      const firstUserCommentDate = new Date(comments[0].date)
      const secondUserComentDate = new Date(comments[1].date)

      expect(comments).toHaveLength(2)
      expect(firstUserCommentDate.getTime()).toBeLessThan(secondUserComentDate.getTime())
    })
  })
})
