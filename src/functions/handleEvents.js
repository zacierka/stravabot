module.exports = (client) => {
    client.handleEvents = async (eventFiles, path) => {
        let eventCount = 0;
        for( const file of eventFiles ) {
            const event = require(`../events/${file}`);
            console.log(`- loading event events/${file}`);
            
            if( event.once ) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            eventCount++;
        }
        console.log(` - ${eventCount} events loaded`);
    }
}