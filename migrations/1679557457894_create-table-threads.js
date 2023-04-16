exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'VARCHAR(256)',
      notNull: true
    },
    body: {
      type: 'TEXT',
      notNull: true
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade'
    },
    created_at: {
      type: 'TEXT',
      notNull: true
    },
    updated_at: {
      type: 'TEXT',
      notNull: true
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('threads')
}
