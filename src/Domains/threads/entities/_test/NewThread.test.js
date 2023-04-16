const NewThread = require('../NewThread')

describe('a NewThread entities', () => {
  it('should throw error when payload didnt contain needed property', () => {
    const payload = {
      title: 'Pawapuan',
      body: 'Deskripsi'
    }

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload didnt meet data type specification', () => {
    const payload = {
      title: {},
      body: true,
      owner: 'user-2005'
    }

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewThread object correctly', () => {
    const payload = {
      title: 'Pawapuan',
      body: 'Deskripsi',
      owner: 'user-2005'
    }

    const newThread = new NewThread(payload)

    expect(newThread).toBeInstanceOf(NewThread)
    expect(newThread.title).toEqual(payload.title)
    expect(newThread.body).toEqual(payload.body)
    expect(newThread.owner).toEqual(payload.owner)
  })
})
