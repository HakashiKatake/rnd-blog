import { defineType, defineField, defineArrayMember } from 'sanity'

export const collectionSchema = defineType({
    name: 'collection',
    title: 'Collection',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Collection Title',
            type: 'string',
            validation: (Rule) => Rule.required().max(50),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'user',
            title: 'Owner',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'posts',
            title: 'Saved Posts',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'post' }] }],
        }),
        defineField({
            name: 'isPrivate',
            title: 'Private Collection',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            user: 'user.name',
            posts: 'posts.length'
        },
        prepare(selection) {
            const { title, user, posts } = selection
            return {
                title,
                subtitle: `by ${user} • ${posts || 0} items`,
            }
        },
    },
})
