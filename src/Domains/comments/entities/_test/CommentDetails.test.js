const CommentDetails = require('../CommentDetails')

describe('a CommentDetails entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      id: 'comment-2004',
      username: 'sakamata'
    }

    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      id: {},
      username: 'sakamata',
      date: 2023,
      content: true,
      is_delete: 'true',
      like_count: null,
      replies: []
    }

    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create CommentDetails object correctly without replies value', () => {
    const payload = {
      id: 'comment-2004',
      username: 'sakamata',
      date: '2023-04-08',
      content: 'Sangat Baik',
      is_delete: false,
      like_count: 2,
      replies: []
    }

    const commentDetails = new CommentDetails(payload)

    expect(commentDetails).toBeInstanceOf(CommentDetails)
    expect(commentDetails.id).toEqual(payload.id)
    expect(commentDetails.username).toEqual(payload.username)
    expect(commentDetails.date).toEqual(payload.date)
    expect(commentDetails.content).toEqual(payload.content)
    expect(commentDetails.replies).toEqual([])
  })

  it('should create CommentDetails object correctly', () => {
    const payload = {
      id: 'comment-2004',
      username: 'sakamata',
      date: '2022-09-28',
      content: 'Baik Sekali Dia',
      is_delete: false,
      like_count: 2,
      replies: [
        {
          id: 'reply-2004',
          username: 'chloe',
          date: '2022-09-29',
          content: 'Afa iyah'
        }
      ]
    }

    const commentDetails = new CommentDetails(payload)

    expect(commentDetails).toBeInstanceOf(CommentDetails)
    expect(commentDetails.id).toEqual(payload.id)
    expect(commentDetails.username).toEqual(payload.username)
    expect(commentDetails.date).toEqual(payload.date)
    expect(commentDetails.content).toEqual(payload.content)
    expect(commentDetails.replies).toEqual(payload.replies)
  })

  it('should create CommentDetails object correctly without replies value when content has been deleted', () => {
    const payload = {
      id: 'comment-2004',
      username: 'sakamata',
      date: '2023-04-08',
      content: 'Sangat Baik',
      is_delete: true,
      replies: []
    }

    const commentDetails = new CommentDetails(payload)

    expect(commentDetails).toBeInstanceOf(CommentDetails)
    expect(commentDetails.id).toEqual(payload.id)
    expect(commentDetails.username).toEqual(payload.username)
    expect(commentDetails.date).toEqual(payload.date)
    expect(commentDetails.content).toEqual('**komentar telah dihapus**')
    expect(commentDetails.replies).toEqual([])
  })

  it('should create CommentDetails object correctly when content has been deleted', () => {
    const payload = {
      id: 'comment-2004',
      username: 'sakamata',
      date: '2022-09-28',
      content: 'Baik Sekali Dia',
      is_delete: true,
      replies: [
        {
          id: 'reply-2004',
          username: 'chloe',
          date: '2022-09-29',
          content: 'Afa iyah'
        }
      ]
    }

    const commentDetails = new CommentDetails(payload)

    expect(commentDetails).toBeInstanceOf(CommentDetails)
    expect(commentDetails.id).toEqual(payload.id)
    expect(commentDetails.username).toEqual(payload.username)
    expect(commentDetails.date).toEqual(payload.date)
    expect(commentDetails.content).toEqual('**komentar telah dihapus**')
    expect(commentDetails.replies).toEqual(payload.replies)
  })
})
