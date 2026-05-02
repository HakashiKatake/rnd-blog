import { postSchema } from './post'
import { userSchema } from './user'
import { eventRegistrationSchema } from './eventRegistration'
import { questSchema } from './quest'
import { collaborationSchema } from './collaboration'
import { questParticipantSchema } from './questParticipant'
import { homeSettingsSchema } from './homeSettings'

import { collectionSchema } from './collection'

import { eventSchema } from './event'
export const schemaTypes = [
    homeSettingsSchema,
    postSchema,
    userSchema,
    questSchema,
    collaborationSchema,
    collectionSchema,
    questParticipantSchema,
    eventSchema,
    eventRegistrationSchema,
]
