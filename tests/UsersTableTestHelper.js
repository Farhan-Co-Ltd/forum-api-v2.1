/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const UsersTableTestHelper = {
  async addUser ({ id = 'user-2005', username = 'chloe', password = 'himitsu', fullname = 'Chloe Pawapua' }) {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname]
    }

    await pool.query(query)
  },
  async findUsersById (id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id]
    }

    const { rows } = await pool.query(query)
    return rows
  },
  async cleanTable () {
    await pool.query('DELETE FROM users WHERE 1=1')
  }
}

module.exports = UsersTableTestHelper
