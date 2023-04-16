/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentsTableTestHelper = {
  async addComment ({ id = 'comment-2004', content = 'Sangat Baik', threadId = 'thread-2004', owner = 'user-2005', date }) {
    const isDelete = false
    const createdAt = date || new Date().toISOString()
    const updatedAt = createdAt
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, threadId, owner, isDelete, createdAt, updatedAt]
    }

    await pool.query(query)
  },

  async findCommentsById (id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id]
    }
    const { rows } = await pool.query(query)

    return rows
  },

  async deleteCommentById (id) {
    const query = {
      text: 'DELETE FROM comments WHERE id = $1',
      values: [id]
    }

    await pool.query(query)
  },

  async cleanTable () {
    await pool.query('DELETE FROM comments WHERE 1=1')
  }
}

module.exports = CommentsTableTestHelper
