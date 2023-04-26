const routes = require('./routes')
const LikeCommentHandler = require('./handler')

module.exports = {
  name: 'likeComment',
  register: async (server, { container }) => {
    const likeCommentHandler = new LikeCommentHandler(container)
    server.route(routes(likeCommentHandler))
  }
}
