const AddedThread = require('../AddedThread')

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-2004',
      title: 'Pawapuan'
    }

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 2004,
      title: {},
      owner: true
    }

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create AddedThread object correctly', () => {
    const payload = {
      id: 'thread-2004',
      title: 'Pawapuan',
      owner: 'user-2005'
    }

    const addedThread = new AddedThread(payload)

    expect(addedThread).toBeInstanceOf(AddedThread)
    expect(addedThread.id).toEqual(payload.id)
    expect(addedThread.title).toEqual(payload.title)
    expect(addedThread.owner).toEqual(payload.owner)
  })
})
