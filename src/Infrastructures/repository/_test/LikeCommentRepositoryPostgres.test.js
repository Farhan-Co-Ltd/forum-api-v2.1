const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const LikeCommentTableTestHelper = require('../../../../tests/LikeCommentTableTestHelper')
const pool = require('../../database/postgres/pool')
const LikeCommentRepositoryPostgres = require('../LikeCommentRepositoryPostgres')

describe('LikeCommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await CommentsTableTestHelper.cleanTable()
    await LikeCommentTableTestHelper.cleanTable()
  })

  describe('addLikeComment function', () => {
    it('should should persist new like comment and return added like to the comment correctly ', async () => {
      const userId = 'user-2005'
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'

      await UsersTableTestHelper.addUser({ id: userId })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })

      const newLikeComment = {
        commentId,
        owner: userId
      }

      const fakeIdGenereator = () => '2004'
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, fakeIdGenereator)

      const addedLike = await likeCommentRepositoryPostgres.addLikeComment(newLikeComment)

      const likeComment = await LikeCommentTableTestHelper.findLikeCommentById('like_comment-2004')
      expect(likeComment).toHaveLength(1)
      expect(likeComment[0].id).toBe(addedLike.id)
      expect(likeComment[0].comment_id).toBe(newLikeComment.commentId)
      expect(likeComment[0].owner).toBe(newLikeComment.owner)
    })
  })

  describe('checkAvalabilityLikeComment function', () => {
    it('should return false when like comment not available', async () => {
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool)
      const commentId = 'comment-2004'
      const owner = 'machigai-owner-id'

      const isAvailableLikeComment = await likeCommentRepositoryPostgres.checkAvailabilityLikeComment({ commentId, owner })

      expect(isAvailableLikeComment).toBe(false)
    })

    it('should return true when like comment available', async () => {
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool)
      const threadId = 'thread-2004'
      const commentId = 'comment-2004'
      const likeCommentId = 'like_comment-2004'
      const owner = 'user-2005'

      await UsersTableTestHelper.addUser({ id: owner })
      await ThreadsTableTestHelper.addThread({ id: threadId, owner })
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner })
      await LikeCommentTableTestHelper.addLikeComment({ id: likeCommentId, commentId, owner })

      const isAvailableLikeComment = await likeCommentRepositoryPostgres.checkAvailabilityLikeComment({ commentId, owner })

      expect(isAvailableLikeComment).toBe(true)
    })

    describe('deleteLikeComment function', () => {
      it('should delete like comment', async () => {
        const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool)
        const userId = 'user-2005'
        const threadId = 'thread-2004'
        const commentId = 'comment-2004'
        const likeCommentId = 'like_comment-2004'

        await UsersTableTestHelper.addUser({ id: userId })
        await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId })
        await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId })
        await LikeCommentTableTestHelper.addLikeComment({ id: likeCommentId, commentId, owner: userId })

        const likeCommentBeforeDelete = await LikeCommentTableTestHelper.findLikeCommentById(likeCommentId)

        await likeCommentRepositoryPostgres.deleteLikeComment({ commentId, owner: userId })

        const likeCommentAfterDelete = await LikeCommentTableTestHelper.findLikeCommentById(likeCommentId)

        expect(likeCommentBeforeDelete).toHaveLength(1)
        expect(likeCommentAfterDelete).toHaveLength(0)
      })
    })
  })
})
