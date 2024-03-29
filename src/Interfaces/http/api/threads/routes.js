const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: 'forumapi_jwt'
    }
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: (request) => handler.getThreadDetailsHandler(request)
  }
])

module.exports = routes
