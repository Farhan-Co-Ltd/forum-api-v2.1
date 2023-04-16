/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const RepliesTableTestHelper = {
  async addReply ({ id = 'reply-2004', content = 'Apa iya', commentId = 'comment-2004', owner = 'user-2005', date }) {
    const isDelete = false
    const createdAt = date || new Date().toISOString()
    const updatedAt = createdAt
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, commentId, owner, isDelete, createdAt, updatedAt]
    }

    await pool.query(query)
  },

  async findRepliesById (id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id]
    }

    const { rows } = await pool.query(query)
    return rows
  },

  async deleteReplyById (id) {
    const query = {
      text: 'DELETE FROM replies WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async cleanTable () {
    await pool.query('DELETE FROM replies WHERE 1=1')
  }
}

module.exports = RepliesTableTestHelper
