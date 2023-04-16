const AddReplyUseCase = require('../AddReplyUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository')
const AddedReply = require('../../../../Domains/replies/entities/AddedReply')
const NewReply = require('../../../../Domains/replies/entities/NewReply')

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-2004',
      commentId: 'comment-2004',
      content: 'Apa Iya',
      owner: 'user-2005'
    }

    const expectedAddedReply = {
      id: 'reply-2004',
      content: 'Apa Iya',
      owner: 'user-2005'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingReplyRepository = new ReplyRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve())
    mockingReplyRepository.addReply = jest.fn(() => Promise.resolve(new AddedReply({
      id: 'reply-2004',
      content: useCasePayload.content,
      owner: useCasePayload.owner
    })))

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockingReplyRepository,
      commentRepository: mockingCommentRepository,
      threadRepository: mockingThreadRepository
    })

    const addedReply = await addReplyUseCase.execute(useCasePayload)

    const newReply = new NewReply({
      content: useCasePayload.content,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner
    })

    expect(addedReply).toStrictEqual(new AddedReply(expectedAddedReply))
    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId)
    expect(mockingReplyRepository.addReply).toBeCalledWith(newReply)
  })
})
