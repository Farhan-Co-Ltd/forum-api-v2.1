const ThreadDetails = require('../ThreadDetails')

describe('a ThreadDetails entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi'
    }

    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      id: 2004,
      title: {},
      body: true,
      date: '2004-04-08',
      username: 'chloe',
      comments: []
    }

    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create commentDetails object correctly with comments hasnt value', () => {
    const payload = {
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2005-09-28',
      username: 'chloe',
      comments: []
    }

    const threadDetails = new ThreadDetails(payload)

    expect(threadDetails).toBeInstanceOf(ThreadDetails)
    expect(threadDetails.id).toEqual(payload.id)
    expect(threadDetails.title).toEqual(payload.title)
    expect(threadDetails.body).toEqual(payload.body)
    expect(threadDetails.date).toEqual(payload.date)
    expect(threadDetails.username).toEqual(payload.username)
    expect(threadDetails.comments).toEqual([])
  })

  it('should create commentDetails object correctly', () => {
    const payload = {
      id: 'thread-2004',
      title: 'Pawapuan',
      body: 'Deskripsi',
      date: '2005-09-28',
      username: 'chloe',
      comments: [
        {
          id: 'comment-2004',
          username: 'sakamata',
          date: '2004-04-08',
          content: 'Sangat Baik'
        }
      ]
    }

    const threadDetails = new ThreadDetails(payload)

    expect(threadDetails).toBeInstanceOf(ThreadDetails)
    expect(threadDetails.id).toEqual(payload.id)
    expect(threadDetails.title).toEqual(payload.title)
    expect(threadDetails.body).toEqual(payload.body)
    expect(threadDetails.date).toEqual(payload.date)
    expect(threadDetails.username).toEqual(payload.username)
    expect(threadDetails.comments).toEqual(payload.comments)
  })
})
