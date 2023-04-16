const NewReply = require('../NewReply')

describe('a NewReply entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      commentId: 'comment-2004'
    }

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      commentId: 'comment-2004',
      owner: 2005,
      content: true
    }

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewReply object correctly', () => {
    const payload = {
      commentId: 'comment-2004',
      owner: 'user-2005',
      content: 'Apa Iya',
      isDelete: false
    }

    const newReply = new NewReply(payload)
    expect(newReply).toBeInstanceOf(NewReply)
    expect(newReply.commentId).toEqual(payload.commentId)
    expect(newReply.owner).toEqual(payload.owner)
    expect(newReply.content).toEqual(payload.content)
    expect(newReply.isDelete).toEqual(payload.isDelete)
  })
})
