const NewComment = require('../NewComment')

describe('a NewComment entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      content: 'Baik'
    }

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt contain meet data type specification', () => {
    const payload = {
      content: true,
      threadId: 2004,
      owner: {},
      isDelete: 'false'
    }

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewComment object correctly', () => {
    const payload = {
      content: 'Sangat Baik',
      threadId: 'thread-2004',
      owner: 'user-2002',
      isDelete: false
    }

    const newComment = new NewComment(payload)

    expect(newComment).toBeInstanceOf(NewComment)
    expect(newComment.content).toEqual(payload.content)
    expect(newComment.threadId).toEqual(payload.threadId)
    expect(newComment.owner).toEqual(payload.owner)
    expect(newComment.isDelete).toEqual(false)
  })
})
