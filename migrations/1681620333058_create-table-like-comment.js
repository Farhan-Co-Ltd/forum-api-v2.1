exports.up = (pgm) => {
  pgm.createTable('like_comment', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'cascade'
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
  pgm.dropTable('like_comment')
}
