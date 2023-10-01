const { Client } = require('pg');

class Post {
    constructor(id, description, user, image, createdAt, liked) {
        this.id = id;
        this.description = description;
        this.user = user;
        this.image = image;
        this.createdAt = createdAt;
        this.liked = liked;
    }
}

class User {
    constructor(id, username, profilePicture, followed) {
        this.id = id;
        this.username = username;
        this.profilePicture = profilePicture;
        this.followed = followed;
    }
}

const connectToDatabase = async() => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'scorp_db',
        password: '1',
        port: 5433
    });

    try {
        await client.connect();
        console.log('Connected to the database');
        return client;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

const fetchPost = async(post_id, client) => {
    try {
        const query = {
            text: 'SELECT * FROM post WHERE id = $1',
            values: [post_id]
        };
        const result = await client.query(query);
        return result.rows[0];
    } catch (error) {
        console.error('Error retrieving the post:', error);
        throw error;
    }
};

const fetchUser = async(user_id, client) => {
    try {
        const query = {
            text: 'SELECT * FROM sUser WHERE id = $1',
            values: [user_id]
        };
        const result = await client.query(query);
        return result.rows[0];
    } catch (error) {
        console.error('Error retrieving the user:', error);
        throw error;
    }
};

const fetchLike = async(user_id, post_id, client) => {
    try {
        const queryLiked = {
            text: 'SELECT COUNT(*) AS row_count FROM sLike WHERE post_id = $1 AND user_id = $2',
            values: [post_id, user_id]
        };
        const result = await client.query(queryLiked);
        return result.rows[0].row_count > 0;
    } catch (error) {
        console.error('Error retrieving the like:', error);
        throw error;
    }
};


const get_posts = async(user_id, post_ids, client) => {
    const posts = [];

    for (const post_id of post_ids) {
        const dbPost = await fetchPost(post_id, client);

        if (dbPost) {
            const dbUser = await fetchUser(dbPost.user_id, client);
            const user = new User(user_id, dbUser.username, dbUser.profile_picture, null);

            const liked = await fetchLike(user_id, post_id, client);

            const post = new Post(post_id, dbPost.description, user, dbPost.image, dbPost.created_at, liked);
            posts.push(post);
        } else {
            posts.push(null);
        }
    }

    return posts;
};

const main = async() => {
    const userId = 102;
    const post_ids = [1, 2, 3];
    const client = await connectToDatabase();

    try {
        const posts = await get_posts(userId, post_ids, client); // QUESTION 1
        console.log('Q1: Posts:', posts);


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await client.end();
        console.log('Disconnected from the database');
    }
};

main();