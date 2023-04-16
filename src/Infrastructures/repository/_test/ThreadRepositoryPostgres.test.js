const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const NewThread = require('../../../Domains/threads/entities/NewThread')
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ThreadRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
  })

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({})
      const user = await UsersTableTestHelper.findUsersById('user-2005')

      const newThread = new NewThread({
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: user[0].id
      })

      const fakeIdGenerator = () => '2004'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)

      const addedThread = await threadRepositoryPostgres.addThread(newThread)
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-2004')

      expect(addedThread).toStrictEqual(new AddedThread({
        id: `thread-${fakeIdGenerator()}`,
        title: 'Pawapuan',
        owner: 'user-2005'
      }))
      expect(threads).toHaveLength(1)
    })
  })

  describe('checkAvailabilityThread function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool)
      const threadId = 'machigai-tuherido'

      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .rejects
        .toThrow(NotFoundError)
    })

    it('shouldnt throw NotFoundError when thread available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool)
      const threadId = 'thread-2004'

      await UsersTableTestHelper.addUser({ id: 'user-2005' })

      const users = await UsersTableTestHelper.findUsersById('user-2005')
      const userId = users[0].id

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId
      })

      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .resolves
        .not.toThrow(NotFoundError)
    })
  })

  describe('getThreadById function', () => {
    it('should return detail correctly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool)
      const createdAt = new Date().toISOString()

      const user = {
        id: 'user-2005',
        username: 'chloe',
        fullname: 'Chloe Pawapua'
      }

      const thread = {
        id: 'thread-2004',
        title: 'Pawapuan',
        body: 'Deskripsi',
        owner: user.id,
        date: createdAt
      }

      const expectedThreadDetails = {
        id: thread.id,
        title: thread.title,
        body: thread.body,
        date: thread.date,
        username: user.username,
        comments: []
      }

      await UsersTableTestHelper.addUser({ ...user })
      await ThreadsTableTestHelper.addThread({ ...thread })

      const threadDetails = await threadRepositoryPostgres.getThreadById(thread.id)

      expect(threadDetails).toStrictEqual(new ThreadDetails({ ...expectedThreadDetails }))
    })
  })
})
