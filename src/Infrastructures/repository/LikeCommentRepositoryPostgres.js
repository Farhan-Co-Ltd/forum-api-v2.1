const LikeCommentRepository = require('../../Domains/like_comment/LikeCommentRepository')

class LikeCommentRepositoryPostgres extends LikeCommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addLikeComment ({ commentId, owner }) {
    const id = `like_comment-${this._idGenerator()}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO like_comment VALUES($1, $2, $3, $4, $5) RETURNING id, comment_id, owner',
      values: [id, commentId, owner, createdAt, updatedAt]
    }

    const { rows } = await this._pool.query(query)

    return rows[0]
  }

  async checkAvailabilityLikeComment ({ commentId, owner }) {
    const query = {
      text: 'SELECT comment_id, owner FROM like_comment WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner]
    }

    const { rowCount } = await this._pool.query(query)

    if (rowCount) {
      return true
    }
    return false
  }

  async deleteLikeComment ({ commentId, owner }) {
    const query = {
      text: 'DELETE FROM like_comment WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner]
    }

    await this._pool.query(query)
  }
}

module.exports = LikeCommentRepositoryPostgres
