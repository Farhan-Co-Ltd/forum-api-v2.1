class ReplyDetails {
  constructor (payload) {
    this._verifyPayload(payload)

    const { id, username, date, is_delete: isDelete, content } = payload
    this.id = id
    this.username = username
    this.date = date
    this.content = isDelete ? '**balasan telah dihapus**' : content
  }

  _verifyPayload ({ id, username, date, is_delete: isDelete, content }) {
    if (!id || !username || !date || isDelete === undefined || !content) {
      throw new Error('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof isDelete !== 'boolean' || typeof content !== 'string') {
      throw new Error('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = ReplyDetails
