class LikeCommentRepository {
  async addLikeComment ({ commentId, owner }) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async checkAvailabilityLikeComment ({ commentId, owner }) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async deleteLikeComment ({ commentId, owner }) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = LikeCommentRepository
