const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails')
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails')
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails')

class GetThreadDetailsUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
  }

  async execute (useCasePayload) {
    const { threadId } = useCasePayload

    await this._threadRepository.checkAvailabilityThread(threadId)

    const threadDetails = await this._threadRepository.getThreadById(threadId)
    const comments = await this._commentRepository.getCommentsByThreadId(threadId)

    threadDetails.comments = await Promise.all(comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id)
      comment.replies = replies.map((reply) => new ReplyDetails(reply))

      return new CommentDetails(comment)
    }))

    return new ThreadDetails(threadDetails)
  }
}

module.exports = GetThreadDetailsUseCase
