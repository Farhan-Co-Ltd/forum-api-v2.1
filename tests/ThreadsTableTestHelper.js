/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const ThreadsTableTestHelper = {
  async addThread ({ id = 'thread-2004', title = 'Pawapuan', body = 'Deskripsi', owner = 'user-2005', date }) {
    const updatedAt = date || new Date().toISOString()
    const createdAt = updatedAt
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt, updatedAt]
    }

    await pool.query(query)
  },

  async findThreadsById (id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id]
    }

    const { rows } = await pool.query(query)
    return rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM threads WHERE 1=1')
  }
}

module.exports = ThreadsTableTestHelper
