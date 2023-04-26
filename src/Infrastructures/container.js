/* istanbul ignore file */

const { createContainer } = require('instances-container')

// external agency
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const pool = require('./database/postgres/pool')
const Jwt = require('@hapi/jwt')

// service (repository, helper, manager, etc)
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres')
const BcryptPasswordHash = require('./security/BcryptPasswordHash')
const UserRepository = require('../Domains/users/UserRepository')
const PasswordHash = require('../Applications/security/PasswordHash')

// use case
const AddUserUseCase = require('../Applications/use_case/users/AddUserUseCase')
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager')
const JwtTokenManager = require('./security/JwtTokenManager')
const LoginUserUseCase = require('../Applications/use_case/users/LoginUserUseCase')
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository')
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres')
const LogoutUserUseCase = require('../Applications/use_case/users/LogoutUserUseCase')
const RefreshAuthenticationUseCase = require('../Applications/use_case/authentications/RefreshAuthenticationUseCase')
const ThreadRepository = require('../Domains/threads/ThreadRepository')
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres')
const AddThreadUseCase = require('../Applications/use_case/threads/AddThreadUseCase')
const CommentRepository = require('../Domains/comments/CommentRepository')
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres')
const AddCommentUseCase = require('../Applications/use_case/comments/AddCommentUseCase')
const DeleteCommentUseCase = require('../Applications/use_case/comments/DeleteCommentUseCase')
const ReplyRepository = require('../Domains/replies/ReplyRepository')
const ReplyRepositoryPostgres = require('./repository/ReplyRepositoryPostgres')
const AddReplyUseCase = require('../Applications/use_case/replies/AddReplyUseCase')
const DeleteReplyUseCase = require('../Applications/use_case/replies/DeleteReplyUseCase')
const GetThreadDetailsUseCase = require('../Applications/use_case/threads/GetThreadDetailsUseCase')
const LikeCommentRepository = require('../Domains/like_comment/LikeCommentRepository')
const LikeCommentRepositoryPostgres = require('./repository/LikeCommentRepositoryPostgres')
const LikeCommentUseCase = require('../Applications/use_case/like_comment/LikeCommentUseCase')

// creating container
const container = createContainer()

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt
        }
      ]
    }
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        }
      ]
    }
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token
        }
      ]
    }
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  },
  {
    key: CommentRepository.name,
    Class: CommentRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  },
  {
    key: ReplyRepository.name,
    Class: ReplyRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  },
  {
    key: LikeCommentRepository.name,
    Class: LikeCommentRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool
        },
        {
          concrete: nanoid
        }
      ]
    }
  }
])

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name
        }
      ]
    }
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name
        },
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name
        }
      ]
    }
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        }
      ]
    }
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name
        }
      ]
    }
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'replyRepository',
          internal: ReplyRepository.name
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'replyRepository',
          internal: ReplyRepository.name
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        }
      ]
    }
  },
  {
    key: GetThreadDetailsUseCase.name,
    Class: GetThreadDetailsUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'replyRepository',
          internal: ReplyRepository.name
        }
      ]
    }
  },
  {
    key: LikeCommentUseCase.name,
    Class: LikeCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'commentRepository',
          internal: CommentRepository.name
        },
        {
          name: 'threadRepository',
          internal: ThreadRepository.name
        },
        {
          name: 'likeCommentRepository',
          internal: LikeCommentRepository.name
        }
      ]
    }
  }
])

module.exports = container
