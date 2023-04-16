const DomainErrorTranslator = require('../DomainErrorTranslator')
const InvariantError = require('../InvariantError')

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena property yang dibutuhkan tidak ada'))
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'))
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'))
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'))

    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'))
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('username dan password harus string'))

    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'))
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'))

    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'))
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'))

    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('gagal menambahkan thread, property tidak lengkap'))
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('gagal menambahkan thread, tipe data tidak sesuai'))

    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('gagal menambahkan komentar, property tidak lengkap'))
    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('gagal menambahkan komentar, tipe data tidak sesuai'))

    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('gagal menghapus komentar, property tidak lengkap'))
    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('gagal menghapus komentar, tipe data tidak sesuai'))

    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('gagal menambahkan balasan, property tidak lengkap'))
    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('gagal menambahkan balasan, tipe data tidak sesuai'))
  })

  it('should return original error when error message is not needed to translate', () => {
    const error = new Error('some_error_message')

    const translatedError = DomainErrorTranslator.translate(error)

    expect(translatedError).toStrictEqual(error)
  })
})
