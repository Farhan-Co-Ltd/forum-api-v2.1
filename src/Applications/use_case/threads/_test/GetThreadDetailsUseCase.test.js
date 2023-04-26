const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository')

describe('GetThreadDetailsUseCase', () => {
  it('should orchetrating the get thread detail action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-2004'
    }

    const expectedThreadDetails = {
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2005-09-28',
      username: 'chloe',
      comments: [
        {
          id: 'comment-2004',
          username: 'sakamata',
          date: '2005-09-29',
          content: 'Sangat Baik',
          likeCount: 1,
          replies: [
            {
              id: 'reply-2004',
              content: 'Apa Iya',
              date: '2005-09-30',
              username: 'chloe'
            }
          ]
        }
      ]
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingReplyRepository = new ReplyRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2005-09-28',
      username: 'chloe'
    }))
    mockingCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-2004',
        username: 'sakamata',
        date: '2005-09-29',
        content: 'Sangat Baik',
        is_delete: false,
        like_count: 1
      }
    ]))
    mockingReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve([
      {
        id: 'reply-2004',
        content: 'Apa Iya',
        date: '2005-09-30',
        username: 'chloe',
        is_delete: false
      }
    ]))

    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockingThreadRepository,
      commentRepository: mockingCommentRepository,
      replyRepository: mockingReplyRepository
    })

    const threadDetails = await getThreadDetailsUseCase.execute(useCasePayload)

    expect(threadDetails).toEqual(expectedThreadDetails)
    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId)
    expect(mockingReplyRepository.getRepliesByCommentId).toBeCalledWith(expectedThreadDetails.comments[0].id)
  })

  it('should orchetrating the get thread details if content has been deleted', async () => {
    const useCasePayload = { threadId: 'thread-2004' }
    const expectedThreadDetails = {
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2023-03-21',
      username: 'chloe',
      comments: [
        {
          id: 'comment-2004',
          username: 'chloe',
          date: '2023-04-01',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-2004',
              content: '**balasan telah dihapus**',
              date: '2023-04-02',
              username: 'chloe'
            }
          ]
        }
      ]
    }

    const mockingThreadRepository = new ThreadRepository()
    const mockingCommentRepository = new CommentRepository()
    const mockingReplyRepository = new ReplyRepository()

    mockingThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve())
    mockingThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2023-03-21',
      username: 'chloe',
      comments: []
    }))
    mockingCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-2004',
        username: 'chloe',
        date: '2023-04-01',
        content: '**komentar telah dihapus**',
        is_delete: true,
        replies: []
      }
    ]))
    mockingReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve([
      {
        id: 'reply-2004',
        content: '**balasan telah dihapus**',
        date: '2023-04-02',
        username: 'chloe',
        is_delete: true
      }
    ]))

    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockingThreadRepository,
      commentRepository: mockingCommentRepository,
      replyRepository: mockingReplyRepository
    })

    const threadDetails = await getThreadDetailsUseCase.execute(useCasePayload)

    expect(threadDetails).toEqual(expectedThreadDetails)
    expect(mockingThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId)
    expect(mockingThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId)
    expect(mockingCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId)
    expect(mockingReplyRepository.getRepliesByCommentId).toBeCalledWith(expectedThreadDetails.comments[0].id)
  })
})
