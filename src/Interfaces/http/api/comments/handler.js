const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase')
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase')

class CommentsHandler {
  constructor (container) {
    this._container = container
  }

  async postCommentHandler (request, h) {
    const { content } = request.payload
    const { threadId } = request.params
    const { id: owner } = request.auth.credentials

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name)
    const addedComment = await addCommentUseCase.execute({ content, threadId, owner })

    const response = h.response({
      status: 'success',
      data: {
        addedComment
      }
    })
    response.code(201)
    return response
  }

  async deleteCommentHandler (request) {
    const { threadId, commentId } = request.params
    const { id: owner } = request.auth.credentials

    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name)
    await deleteCommentUseCase.execute({ commentId, threadId, owner })

    return {
      status: 'success',
      message: 'komentar dihapus'
    }
  }
}

module.exports = CommentsHandler
