const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: (request) => handler.putLikeCommentHandler(request),
    options: {
      auth: 'forumapi_jwt'
    }
  }
])

module.exports = routes
