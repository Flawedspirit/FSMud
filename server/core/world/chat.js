const WebSocket = require('ws');
const Packet = require('./packet.js');
const {  Log } = baseRequire('server/core/tools');
const Registry = baseRequire('server/core/registry');
const Command = require('./commands');

module.exports = {
    processMessage(message, socket, server) {
        try {
            // Get username of incoming chat message from sender UUID
            const messageIn = JSON.parse(message.toJSON());
            sender = Registry.get('players', messageIn.data.sender);
            chatMsg = messageIn.data.message;

            // Check if message is a command
            if(chatMsg.substring(0, 1) === '/' || chatMsg.substring(0, 1) === '.') {
                const command = chatMsg.substring(1);
                Command.processCommand(socket, command);
            } else {
                server.clients.forEach((client) => {
                    if(client.readyState === WebSocket.OPEN) {
                        const response = new Packet('CHAT_REPLY', {username: sender.name, permission: sender.permissions, message: chatMsg}, Date.now()).toJSON();
                        client.send(response);
                    }
                });
            }
        } catch(err) {
            Log.message(err, 'ERROR');
        }
    }
}

