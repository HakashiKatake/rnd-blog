import { defineField, defineType } from 'sanity'

export const questParticipantSchema = defineType({
    name: 'questParticipant',
    title: 'Quest Participant',
    type: 'document',
    fields: [
        defineField({
            name: 'quest',
            title: 'Quest',
            type: 'reference',
            to: [{ type: 'quest' }],
            validation: (Rule) => Rule.required(),
            // References are indexed by default in Sanity
        }),
        defineField({
            name: 'user',
            title: 'User',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
            // References are indexed by default in Sanity
        }),
        defineField({
            name: 'joinedAt',
            title: 'Joined At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Active', value: 'active' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Dropped', value: 'dropped' },
                ],
            },
            initialValue: 'active',
            validation: (Rule) => Rule.required(),
        })
    ],
    preview: {
        select: {
            userName: 'user.name',
            questTitle: 'quest.title',
            media: 'user.avatar'
        },
        prepare({ userName, questTitle, media }) {
            return {
                title: userName || 'Unknown User',
                subtitle: questTitle || 'Unknown Quest',
                media
            }
        }
    }
})
