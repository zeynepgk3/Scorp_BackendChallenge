const { Client } = require('pg');

class Post {
    constructor(id, owner_id) {
        this.id = id;
        this.owner_id = owner_id;

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

const fetchAllPost = async(client) => {
    try {
        const query = {
            text: 'SELECT * FROM post'
        };
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error retrieving the posts:', error);
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

const mapToDTO = async(dbPosts) => {
    const posts = [];

    for (const dbPost of dbPosts) {
        const post = new Post(dbPost.id, dbPost.user_id);
        posts.push(post);
    }

    return posts;
};


const mix_by_owners = async(posts, mixed_posts = []) => {
    const temp = [];

    for (let i = 0; i < posts.length; i++) {
        if (mix_by_owners.length == 0 || i == 0) {
            mixed_posts.push(posts[i]);
            continue;
        }
        if (posts[i].owner_id == posts[i - 1].owner_id) {
            temp.push(posts[i]);
            continue;
        }
        mixed_posts.push(posts[i]);
    }
    if (temp.length > 0) {
        mix_by_owners(temp, mixed_posts);
    }
    return mixed_posts;
};

const main = async() => {
    const client = await connectToDatabase();

    try {
        const dbPosts = await fetchAllPost(client); // QUESTION 2
        const posts = await mapToDTO(dbPosts);
        const mixed_posts = await mix_by_owners(posts);
        console.log('Q2: Mixed Posts:', mixed_posts);



    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await client.end();
        console.log('Disconnected from the database');
    }
};

main();