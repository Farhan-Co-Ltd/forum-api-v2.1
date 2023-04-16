const ReplyDetails = require('../ReplyDetails')

describe('a ReplyDetails entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      id: 'reply-2004'
    }

    expect(() => new ReplyDetails(payload)).toThrowError('REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const paylaod = {
      id: {},
      username: 'pawapua',
      date: 2002,
      content: 'Apa Iya',
      is_delete: 'false'
    }

    expect(() => new ReplyDetails(paylaod)).toThrowError('REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create ReplyDetails object correctly', () => {
    const payload = {
      id: 'reply-2004',
      username: 'chloe',
      date: '2023-03-01',
      content: 'Apa Iya',
      is_delete: false
    }

    const replyDetails = new ReplyDetails(payload)

    expect(replyDetails).toBeInstanceOf(ReplyDetails)
    expect(replyDetails.id).toEqual(payload.id)
    expect(replyDetails.username).toEqual(payload.username)
    expect(replyDetails.date).toEqual(payload.date)
    expect(replyDetails.content).toEqual(payload.content)
  })

  it('should create ReplyDetails object correctly when content has been deleted', () => {
    const payload = {
      id: 'reply-2004',
      username: 'chloe',
      date: '2023-03-01',
      content: 'Apa Iya',
      is_delete: true
    }

    const replyDetails = new ReplyDetails(payload)

    expect(replyDetails).toBeInstanceOf(ReplyDetails)
    expect(replyDetails.id).toEqual(payload.id)
    expect(replyDetails.username).toEqual(payload.username)
    expect(replyDetails.date).toEqual(payload.date)
    expect(replyDetails.content).toEqual('**balasan telah dihapus**')
  })
})
