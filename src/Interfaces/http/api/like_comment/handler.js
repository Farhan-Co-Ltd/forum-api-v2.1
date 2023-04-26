const LikeCommentUseCase = require('../../../../Applications/use_case/like_comment/LikeCommentUseCase')

class LikeCommentHandler {
  constructor (container) {
    this._container = container
  }

  async putLikeCommentHandler (request) {
    const { threadId, commentId } = request.params
    const { id: owner } = request.auth.credentials

    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name)

    await likeCommentUseCase.execute({ threadId, commentId, owner })

    return {
      status: 'success'
    }
  }
}

module.exports = LikeCommentHandler
