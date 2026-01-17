import { postSchema } from './post'
import { userSchema } from './user'
import { questSchema } from './quest'
import { collaborationSchema } from './collaboration'

import { collectionSchema } from './collection'

export const schemaTypes = [
    postSchema,
    userSchema,
    questSchema,
    collaborationSchema,
    collectionSchema,
]
