const DeleteCommentUseCase = require('../DeleteCommentUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload didnt contain needed property', async () => {
    const useCasePayload = {
      commentId: 'comment-2004'
    }
    const deleteCommentUseCase = new DeleteCommentUseCase({})

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error if use case payload didnt meet data type specification', async () => {
    const useCasePayload = {
      commentId: {},
      threadId: 'thread-2004',
      owner: 2005
    }
    const deleteCommentUseCase = new DeleteCommentUseCase({})

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      commentId: 'comment-2004',
      threadId: 'thread-2004',
      owner: 'user-2002'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve())
    mockingCommentRepository.verifyCommentAccess = jest.fn(() => Promise.resolve())
    mockingCommentRepository.deleteComment = jest.fn(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockingCommentRepository,
      threadRepository: mockingThreadRepository
    })

    await deleteCommentUseCase.execute(useCasePayload)

    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockingCommentRepository.verifyCommentAccess).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })
    expect(mockingCommentRepository.deleteComment).toBeCalledWith(useCasePayload.commentId)
  })
})
