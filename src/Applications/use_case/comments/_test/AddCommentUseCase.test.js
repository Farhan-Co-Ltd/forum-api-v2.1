const AddCommentUseCase = require('../AddCommentUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')
const AddedComment = require('../../../../Domains/comments/entities/AddedComment')
const NewComment = require('../../../../Domains/comments/entities/NewComment')

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-2004',
      content: 'Sangat Baik',
      owner: 'user-2002'
    }

    const expectedAddedComment = {
      id: 'comment-2004',
      content: 'Sangat Baik',
      owner: 'user-2002'
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingCommentRepository.addComment = jest.fn(() => Promise.resolve(new AddedComment({
      id: 'comment-2004',
      content: useCasePayload.content,
      owner: useCasePayload.owner
    })))

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockingCommentRepository,
      threadRepository: mockingThreadRepository
    })

    const addedComment = await addCommentUseCase.execute(useCasePayload)
    const newComment = new NewComment({
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner
    })

    expect(addedComment).toStrictEqual(new AddedComment(expectedAddedComment))
    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.addComment).toBeCalledWith(newComment)
  })
})
