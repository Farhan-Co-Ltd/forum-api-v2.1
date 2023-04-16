const ThreadRepository = require('../../Domains/threads/ThreadRepository')
const AddedThread = require('../../Domains/threads/entities/AddedThread')
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addThread (newThread) {
    const { title, body, owner } = newThread
    const id = `thread-${this._idGenerator()}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt, updatedAt]
    }

    const { rows } = await this._pool.query(query)

    return new AddedThread(rows[0])
  }

  async checkAvailabilityThread (threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('thread tidak ditemukan')
    }
  }

  async getThreadById (threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, created_at as date, users.username FROM threads 
            LEFT JOIN users ON users.id = threads.owner 
            WHERE threads.id = $1`,
      values: [threadId]
    }

    const { rows } = await this._pool.query(query)

    return new ThreadDetails({ ...rows[0], comments: [] })
  }
}

module.exports = ThreadRepositoryPostgres
