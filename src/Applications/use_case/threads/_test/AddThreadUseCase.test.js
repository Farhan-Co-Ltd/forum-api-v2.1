const AddThreadUseCase = require('../AddThreadUseCase')
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository')
const AddedThread = require('../../../../Domains/threads/entities/AddedThread')
const NewThread = require('../../../../Domains/threads/entities/NewThread')

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Pawapuan',
      body: 'Deskripsi',
      owner: 'user-2005'
    }

    const expectedAddedThread = {
      id: 'thread-2004',
      title: 'Pawapuan',
      owner: 'user-2005'
    }

    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(new AddedThread({
      id: 'thread-2004',
      title: useCasePayload.title,
      owner: useCasePayload.owner
    })))

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository })

    const addedThread = await addThreadUseCase.execute(useCasePayload)

    expect(addedThread).toStrictEqual(new AddedThread(expectedAddedThread))
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner
    }))
  })
})
