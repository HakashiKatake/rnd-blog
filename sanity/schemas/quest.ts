import { defineType, defineField, defineArrayMember } from 'sanity'

export const questSchema = defineType({
    name: 'quest',
    title: 'Quest',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'The "What If..." question',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'markdown',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'proposedBy',
            title: 'Proposed By',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'participants',
            title: 'Participants',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'reference',
                    to: [{ type: 'user' }],
                }),
            ],
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Open', value: 'open' },
                    { title: 'Active', value: 'active' },
                    { title: 'Completed', value: 'completed' },
                ],
            },
            initialValue: 'open',
        }),
        defineField({
            name: 'timeline',
            title: 'Timeline Milestones',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        { name: 'title', type: 'string', title: 'Milestone Title' },
                        { name: 'dueDate', type: 'datetime', title: 'Due Date' },
                        {
                            name: 'status', type: 'string', title: 'Status', options: {
                                list: ['pending', 'in-progress', 'completed']
                            }
                        },
                    ],
                }),
            ],
        }),
        defineField({
            name: 'rewardPoints',
            title: 'Reward Points',
            type: 'number',
            initialValue: 100,
        }),
        defineField({
            name: 'difficulty',
            title: 'Difficulty',
            type: 'string',
            options: {
                list: [
                    { title: 'Easy', value: 'easy' },
                    { title: 'Medium', value: 'medium' },
                    { title: 'Hard', value: 'hard' },
                ],
            },
            initialValue: 'medium',
        }),
        defineField({
            name: 'daysRemaining',
            title: 'Days Remaining',
            type: 'number',
        }),
        defineField({
            name: 'resources',
            title: 'Resources',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        { name: 'title', type: 'string', title: 'Title' },
                        { name: 'url', type: 'url', title: 'URL' },
                    ],
                }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            status: 'status',
            participants: 'participants',
        },
        prepare(selection) {
            const { title, status, participants = [] } = selection
            return {
                title,
                subtitle: `${status.toUpperCase()} - ${participants.length} participant(s)`,
            }
        },
    },
})
