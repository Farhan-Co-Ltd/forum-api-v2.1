const CommentRepository = require('../../Domains/comments/CommentRepository')
const AddedComment = require('../../Domains/comments/entities/AddedComment')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class CommentRepositoryPostgres extends CommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addComment (newComment) {
    const { content, threadId, owner } = newComment
    const id = `comment-${this._idGenerator()}`
    const isDelete = false
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, threadId, owner, isDelete, createdAt, updatedAt]
    }
    const { rows } = await this._pool.query(query)

    return new AddedComment(rows[0])
  }

  async checkAvailabilityComment (commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId]
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('komentar tidak ditemukan')
    }
  }

  async verifyCommentAccess ({ commentId, owner }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and owner = $2',
      values: [commentId, owner]
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new AuthorizationError('anda tidak memiliki akses pada komentar terpilih')
    }
  }

  async deleteComment (commentId) {
    const isDelete = true
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
      values: [isDelete, commentId]
    }

    await this._pool.query(query)
  }

  async getCommentsByThreadId (threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.created_at as date, comments.content, comments.is_delete FROM comments
            LEFT JOIN users ON users.id = comments.owner
            WHERE thread_id = $1
            ORDER BY created_at ASC`,
      values: [threadId]
    }
    const { rows } = await this._pool.query(query)

    return rows.map((row) => ({ ...row, replies: [] }))
  }
}

module.exports = CommentRepositoryPostgres
