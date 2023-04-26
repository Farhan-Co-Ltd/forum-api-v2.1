/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const LikeCommentTableTestHelper = {
  async addLikeComment ({ id = 'like_comment-2004', commentId = 'comment-2004', owner = 'user-2005', date }) {
    const createdAt = date || new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO like_comment VALUES($1, $2, $3, $4, $5) RETURNING id, comment_id, owner',
      values: [id, commentId, owner, createdAt, updatedAt]
    }

    await pool.query(query)
  },

  async findLikeCommentById (id) {
    const query = {
      text: 'SELECT * FROM like_comment WHERE id = $1',
      values: [id]
    }

    const { rows } = await pool.query(query)
    return rows
  },

  async deleteLikeCommentById (id) {
    const query = {
      text: 'DELETE FROM like_comment WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async cleanTable () {
    await pool.query('DELETE FROM like_comment WHERE 1=1')
  }
}

module.exports = LikeCommentTableTestHelper
