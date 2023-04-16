const ThreadRepository = require('../ThreadRepository')

describe('ThreadsRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const threadRepository = new ThreadRepository()

    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.checkAvailabilityThread('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
