const { query } = require('express-validator');
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,

        //'postgres://fdqnycmjvwkcwz:6bc7a91c041404fa5def368aa9ff6148d098d327b3736f85c2a883f489efc0fa@ec2-35-174-122-153.compute-1.amazonaws.com:5432/d4ans6fv0i5gof',//process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

const readSession = async () => {
    try {
        const res = await client.query('SELECT * FROM wa_seesions ORDER BY created_at DESC LIMIT 1');
        if (res.rows.length) return res.rows[0].session;
        return '';
    } catch (err) {
        throw err;
    }
}

const saveSession = (session) => {
    client.query('INSERT INTO wa_seesions (session) VALUES($1)', [session], (err, results) => {
        if (err) {
            console.error('Failed to save session!', err);
        } else {
            console.log('Session saved!');
        }
    });
}

const removeSession = () => {
    client.query('DELETE FROM wa_seesions', (err, results) => {
        if (err) {
            console.error('Failed to remove session!', err);
        } else {
            console.log('Session deleted!');
        }
    });
}

module.exports = {
    readSession,
    saveSession,
    removeSession
}
