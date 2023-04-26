class CommentDetails {
  constructor (payload) {
    this._verifyPayload(payload)

    const { id, username, date, is_delete: isDelete, content, like_count: likeCount, replies } = payload

    this.id = id
    this.username = username
    this.date = date
    this.content = isDelete ? '**komentar telah dihapus**' : content
    this.replies = replies
    this.likeCount = likeCount
  }

  _verifyPayload ({ id, username, date, is_delete: isDelete, content, like_count: likeCount, replies }) {
    if (!id || !username || !date || isDelete === undefined || !content) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')
    }
    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof isDelete !== 'boolean' || typeof content !== 'string' ||
        (likeCount && typeof likeCount !== 'number') ||
        (replies && !Array.isArray(replies))) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = CommentDetails
