const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase')
const GetThreadDetailsUseCase = require('../../../../Applications/use_case/threads/GetThreadDetailsUseCase')

class ThreadsHandler {
  constructor (container) {
    this._container = container
  }

  async postThreadHandler (request, h) {
    const { title, body } = request.payload
    const { id: owner } = request.auth.credentials

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute({ title, body, owner })

    const response = h.response({
      status: 'success',
      data: {
        addedThread
      }
    })
    response.code(201)
    return response
  }

  async getThreadDetailsHandler (request) {
    const { threadId } = request.params
    const getThreadDetailsUseCase = this._container.getInstance(GetThreadDetailsUseCase.name)
    const thread = await getThreadDetailsUseCase.execute({ threadId })

    return {
      status: 'success',
      data: {
        thread
      }
    }
  }
}

module.exports = ThreadsHandler
