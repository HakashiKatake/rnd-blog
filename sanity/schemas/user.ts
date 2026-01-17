import { defineType, defineField } from 'sanity'

export const userSchema = defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
        defineField({
            name: 'clerkId',
            title: 'Clerk ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: 'avatar',
            title: 'Avatar',
            type: 'image',
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'university',
            title: 'University',
            type: 'string',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'about',
            title: 'About Me',
            type: 'text',
            rows: 5,
        }),
        defineField({
            name: 'education',
            title: 'Education / Qualifications',
            type: 'string', // Could be array, keeping simple for now
        }),
        defineField({
            name: 'isOnboarded',
            title: 'Is Onboarded',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'tier',
            title: 'Tier',
            type: 'number',
            options: {
                list: [
                    { title: 'Spark Initiate (1)', value: 1 },
                    { title: 'Idea Igniter (2)', value: 2 },
                    { title: 'Forge Master (3)', value: 3 },
                    { title: 'RnD Fellow (4)', value: 4 },
                ],
            },
            initialValue: 1,
        }),
        defineField({
            name: 'points',
            title: 'Points',
            type: 'number',
            initialValue: 0,
        }),
        defineField({
            name: 'sparksReceived',
            title: 'Sparks Received',
            type: 'number',
            initialValue: 0,
        }),
        defineField({
            name: 'postsPublished',
            title: 'Posts Published',
            type: 'number',
            initialValue: 0,
        }),
        defineField({
            name: 'collaborationsCount',
            title: 'Collaborations Count',
            type: 'number',
            initialValue: 0,
        }),
        defineField({
            name: 'badges',
            title: 'Badges',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'githubUrl',
            title: 'GitHub URL',
            type: 'url',
        }),
        defineField({
            name: 'linkedinUrl',
            title: 'LinkedIn URL',
            type: 'url',
        }),
        defineField({
            name: 'portfolioUrl',
            title: 'Portfolio URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'university',
            media: 'avatar',
            tier: 'tier',
        },
        prepare(selection) {
            const { title, subtitle, tier } = selection
            const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
            return {
                title,
                subtitle: `${subtitle || 'No University'} - Tier ${tier}: ${tierNames[tier] || 'Unknown'}`,
            }
        },
    },
})
