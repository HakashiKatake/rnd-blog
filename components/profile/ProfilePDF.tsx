
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts for a more premium look
// Font.register({
//     family: 'Inter',
//     fonts: [
//         { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' },
//         { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 'bold' },
//     ]
// });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica', // Fallback to standard font
    },
    header: {
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderBottom: '2px solid #000',
        paddingBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        objectFit: 'cover',
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000000',
    },
    headline: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
    },
    meta: {
        fontSize: 10,
        color: '#888888',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: '1px solid #E5E5E5',
        paddingBottom: 5,
        marginBottom: 10,
        color: '#000000',
        letterSpacing: 1,
    },
    bioText: {
        fontSize: 11,
        lineHeight: 1.5,
        color: '#333333',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#666666',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: '1px solid #E5E5E5',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#999999',
    },
    sparkLogo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    }
});

interface ProfilePDFProps {
    user: any;
    posts: any[];
}

export const ProfilePDF = ({ user, posts }: ProfilePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                {/* We use a proxy or check if image is CORS accessible. 
            For now, we try to use the avatar. If it fails, text fallback isn't easy in PDF Image, 
            so we hope for the best or handle it in parent. */}
                {user.avatar && (
                    <Image
                        style={styles.avatar}
                        src={user.avatar}
                    />
                )}
                <View style={styles.headerText}>
                    <Text style={styles.name}>{user.name || 'Anonymous User'}</Text>
                    <Text style={styles.headline}>{user.bio || 'Member of Spark Community'}</Text>
                    <Text style={styles.meta}>
                        {user.university || 'University unknown'} • {user.email || 'No email provided'}
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.sparksReceived || 0}</Text>
                    <Text style={styles.statLabel}>Sparks</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{posts.length || 0}</Text>
                    <Text style={styles.statLabel}>Projects</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.tier || 1}</Text>
                    <Text style={styles.statLabel}>Tier</Text>
                </View>
            </View>

            {/* About */}
            {user.about && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>{user.about}</Text>
                </View>
            )}

            {/* Education */}
            {user.education && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    <Text style={styles.bioText}>{user.education}</Text>
                </View>
            )}

            {/* Experience / Projects (Posts) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Projects</Text>
                {posts.length > 0 ? (
                    posts.slice(0, 5).map((post: any, index: number) => (
                        <View key={index} style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
                                {post.title}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#666', fontStyle: 'normal', marginBottom: 3 }}>
                                {new Date(post.publishedAt || post._createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#444', lineHeight: 1.4 }}>
                                {post.excerpt || 'No description provided.'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 10, color: '#666' }}>
                        No projects published yet.
                    </Text>
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.sparkLogo}>SPARK ⚡</Text>
                <Text style={styles.footerText}>Generated on {new Date().toLocaleDateString()}</Text>
            </View>

        </Page>
    </Document>
);
