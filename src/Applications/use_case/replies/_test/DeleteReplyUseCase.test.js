const DeleteReplyUseCase = require('../DeleteReplyUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository')

describe('DeleteUseCaseRepository', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      replyId: 'reply-2004',
      commentId: 'comment-2004',
      threadId: 'thread-2004',
      owner: 'user-2005'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingReplyRepository = new ReplyRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve())
    mockingReplyRepository.checkAvailabilityReply = jest.fn(() => Promise.resolve())
    mockingReplyRepository.verifyReplyAccess = jest.fn(() => Promise.resolve())
    mockingReplyRepository.deleteReply = jest.fn(() => Promise.resolve())

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockingReplyRepository,
      commentRepository: mockingCommentRepository,
      threadRepository: mockingThreadRepository
    })

    await deleteReplyUseCase.execute(useCasePayload)

    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockingReplyRepository.checkAvailabilityReply).toBeCalledWith(useCasePayload.replyId)
    expect(mockingReplyRepository.verifyReplyAccess).toBeCalledWith({
      replyId: useCasePayload.replyId,
      owner: useCasePayload.owner
    })
    expect(mockingReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId)
  })
})
