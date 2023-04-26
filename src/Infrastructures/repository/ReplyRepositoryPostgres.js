const ReplyRepository = require('../../Domains/replies/ReplyRepository')
const AddedReply = require('../../Domains/replies/entities/AddedReply')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addReply (newReply) {
    const { content, commentId, owner } = newReply
    const id = `reply-${this._idGenerator()}`
    const isDelete = false
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, commentId, owner, isDelete, createdAt, updatedAt]
    }
    const { rows } = await this._pool.query(query)

    return new AddedReply(rows[0])
  }

  async checkAvailabilityReply (replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId]
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('balasan tidak ditemukan')
    }
  }

  async verifyReplyAccess ({ replyId, owner }) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 and owner = $2',
      values: [replyId, owner]
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new AuthorizationError('anda tidak memiliki akses pada balasan terpilih')
    }
  }

  async deleteReply (replyId) {
    const isDelete = true
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [isDelete, replyId]
    }

    await this._pool.query(query)
  }

  async getRepliesByCommentId (commentId) {
    const commentIds = commentId.split(',')

    const query = {
      text: `SELECT replies.id, replies.content, replies.is_delete, replies.created_at as date, users.username FROM replies
             LEFT JOIN users ON users.id = replies.owner
             WHERE replies.comment_id = ANY($1::text[]) 
             ORDER BY replies.created_at ASC`,
      values: [commentIds]
    }
    const { rows } = await this._pool.query(query)

    return rows
  }
}

module.exports = ReplyRepositoryPostgres
