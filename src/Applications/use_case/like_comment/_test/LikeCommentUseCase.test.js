const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')
const LikeCommentRepository = require('../../../../Domains/like_comment/LikeCommentRepository')
const LikeCommentUseCase = require('../LikeCommentUseCase')

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment if not available', async () => {
    const useCasePayload = {
      threadId: 'thread-2004',
      commentId: 'comment-2004',
      owner: 'user-2005'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingLikeCommentRepository = new LikeCommentRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve())
    mockingLikeCommentRepository.checkAvailabilityLikeComment = jest.fn(() => Promise.resolve(false))
    mockingLikeCommentRepository.addLikeComment = jest.fn(() => Promise.resolve({
      id: 'like_comment-2004',
      commentId: 'comment-2004',
      owner: 'user-2005'
    }))
    mockingLikeCommentRepository.deleteLikeComment = jest.fn(() => Promise.resolve())

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockingThreadRepository,
      commentRepository: mockingCommentRepository,
      likeCommentRepository: mockingLikeCommentRepository
    })

    await likeCommentUseCase.execute(useCasePayload)

    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockingLikeCommentRepository.checkAvailabilityLikeComment).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })
    expect(mockingLikeCommentRepository.addLikeComment).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })
    expect(mockingLikeCommentRepository.deleteLikeComment).not.toBeCalled()
  })

  it('should orchetrating the like comment if available', async () => {
    const useCasePayload = {
      threadId: 'thread-2004',
      commentId: 'comment-2004',
      owner: 'user-2005'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingLikeCommentRepository = new LikeCommentRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve())
    mockingLikeCommentRepository.checkAvailabilityLikeComment = jest.fn(() => Promise.resolve(true))
    mockingLikeCommentRepository.addLikeComment = jest.fn(() => Promise.resolve({
      id: 'like_comment-2004',
      commentId: 'comment-2004',
      owner: 'user-2005'
    }))
    mockingLikeCommentRepository.deleteLikeComment = jest.fn(() => Promise.resolve())

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockingThreadRepository,
      commentRepository: mockingCommentRepository,
      likeCommentRepository: mockingLikeCommentRepository
    })

    await likeCommentUseCase.execute(useCasePayload)

    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockingLikeCommentRepository.checkAvailabilityLikeComment).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })
    expect(mockingLikeCommentRepository.deleteLikeComment).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })
    expect(mockingLikeCommentRepository.addLikeComment).not.toBeCalled()
  })
})
