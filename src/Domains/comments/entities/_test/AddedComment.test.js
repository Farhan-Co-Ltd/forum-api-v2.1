const AddedComment = require('../AddedComment')

describe('a AddedComment entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      id: 'comment-2004',
      content: 'Sangat Baik'
    }

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      id: {},
      content: true,
      owner: 'user-2005'
    }

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create AddedComment object correctly', () => {
    const payload = {
      id: 'comment-2004',
      content: 'Sangat Baik',
      owner: 'user-2005'
    }

    const addedComment = new AddedComment(payload)

    expect(addedComment).toBeInstanceOf(AddedComment)
    expect(addedComment.id).toEqual(payload.id)
    expect(addedComment.content).toEqual(payload.content)
    expect(addedComment.owner).toEqual(payload.owner)
  })
})
