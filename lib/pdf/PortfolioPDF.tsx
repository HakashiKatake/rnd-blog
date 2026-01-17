/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from '@react-pdf/renderer'

// Register fonts if needed, or use standard fonts
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#000000',
    },
    header: {
        flexDirection: 'row',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerLeft: {
        flexGrow: 1,
    },
    headerRight: {
        width: 80,
        height: 80,
        marginLeft: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        objectFit: 'cover',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    userTitle: {
        fontSize: 12,
        color: '#444444',
        marginBottom: 5,
    },
    verifiedBadge: {
        fontSize: 10,
        color: '#000000',
        backgroundColor: '#eeeeee',
        padding: '4 8',
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingBottom: 5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    statBox: {
        width: '33%',
        padding: 10,
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
        color: '#666666',
        textTransform: 'uppercase',
    },
    postItem: {
        marginBottom: 15,
    },
    postTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    postMeta: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 2,
    },
    postExcerpt: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#888888',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 10,
    },
})

interface PortfolioPDFProps {
    user: {
        name: string
        avatar?: string
        tier: number
        university?: string
    }
    stats: {
        totalPoints: number
        postsPublished: number
        sparksReceived: number
        collaborationsJoined: number
        questsCompleted: number
    }
    posts: Array<{
        title: string
        publishedAt: string
        sparkCount: number
        excerpt?: string
    }>
    generatedAt: string
}

const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']

export const PortfolioPDF = ({ user, stats, posts, generatedAt }: PortfolioPDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userTitle}>
                            Tier {user.tier}: {tierNames[user.tier] || 'Member'}
                        </Text>
                        {user.university && (
                            <Text style={styles.userTitle}>{user.university}</Text>
                        )}
                        <Text style={styles.verifiedBadge}>Verified by ITM RnD Club</Text>
                    </View>
                    {user.avatar && (
                        <View style={styles.headerRight}>
                            {/* Note: React-PDF Image src must be absolute URL or base64. 
                  Sanity URLs work if allowed in Next config (though here it's server side) 
               */}
                            <Image style={styles.avatar} src={user.avatar} />
                        </View>
                    )}
                </View>

                {/* Stats */}
                <Text style={styles.sectionTitle}>Performance Overview</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalPoints}</Text>
                        <Text style={styles.statLabel}>Total Points</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.postsPublished}</Text>
                        <Text style={styles.statLabel}>Research Published</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.sparksReceived}</Text>
                        <Text style={styles.statLabel}>Sparks Earned</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.questsCompleted}</Text>
                        <Text style={styles.statLabel}>Quests Completed</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.collaborationsJoined}</Text>
                        <Text style={styles.statLabel}>Collaborations</Text>
                    </View>
                </View>

                {/* Published Research */}
                <Text style={styles.sectionTitle}>Research Highlights</Text>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <View key={index} style={styles.postItem}>
                            <Text style={styles.postTitle}>{post.title}</Text>
                            <Text style={styles.postMeta}>
                                {new Date(post.publishedAt).toLocaleDateString()} • {post.sparkCount} Sparks
                            </Text>
                            <Text style={styles.postExcerpt}>
                                {post.excerpt || 'No summary available.'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 10, color: '#666' }}>No published research yet.</Text>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated by SPARK RnD Platform • {generatedAt} • Verified Proof of Work
                </Text>
            </Page>
        </Document>
    )
}
