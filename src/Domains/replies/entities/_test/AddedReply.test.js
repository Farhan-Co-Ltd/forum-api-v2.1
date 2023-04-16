const AddedReply = require('../AddedReply')

describe('a AddedReply entites', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      id: 'reply-2004'
    }

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      id: 2004,
      content: true,
      owner: {}
    }

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create AddedReply object correctly', () => {
    const payload = {
      id: 'reply-2004',
      content: 'Apa iya',
      owner: 'user-2005'
    }

    const addedReply = new AddedReply(payload)

    expect(addedReply).toBeInstanceOf(AddedReply)
    expect(addedReply.id).toEqual(payload.id)
    expect(addedReply.content).toEqual(payload.content)
    expect(addedReply.owner).toEqual(payload.owner)
  })
})
