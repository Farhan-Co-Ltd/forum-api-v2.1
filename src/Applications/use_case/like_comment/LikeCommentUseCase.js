class LikeCommentUseCase {
  constructor ({ threadRepository, commentRepository, likeCommentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._likeCommentRepository = likeCommentRepository
  }

  async execute (useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload

    await this._threadRepository.checkAvailabilityThread(threadId)
    await this._commentRepository.checkAvailabilityComment(commentId)

    const isAvailableLikeComment = await this._likeCommentRepository.checkAvailabilityLikeComment({ commentId, owner })

    if (isAvailableLikeComment) {
      await this._likeCommentRepository.deleteLikeComment({ commentId, owner })
    } else {
      await this._likeCommentRepository.addLikeComment({ commentId, owner })
    }
  }
}

module.exports = LikeCommentUseCase
