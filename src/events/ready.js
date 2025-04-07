// const db = require('../lib/database');
const { Events } = require('discord.js');
const { pool } = require('../lib/database');
module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Discord client ${client.user.tag} is ready`);

        console.log(`- checking database connection`);
        try {
            const result = await pool.query("SELECT 1");
            if (result.rowCount > 0)
                console.log(` - connected to database`);
        } catch (error) {
            console.log(`Unable to connect to the database ${process.env.PG_DATABASE} @ ${process.env.PG_HOST}`);
            process.exit(1);
        }
    }
}