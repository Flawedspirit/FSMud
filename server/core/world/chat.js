const WebSocket = require('ws');
const Packet = require('./packet.js');
const ServerTick = require('./serverTick.js');
const { Errors, Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Account = baseRequire('server/core/account');
const Event = baseRequire('server/core/event');
const Registry = baseRequire('server/core/registry');

module.exports = {
    processMessage(message, socket, server) {
        try {
            // Get username of incoming chat message from sender UUID
            const messageIn = JSON.parse(message.toJSON());
            sender = Registry.get('players', messageIn.data.sender);
            chatMsg = messageIn.data.message;

            server.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN) {
                    const response = new Packet('CHAT_REPLY', {username: sender.name, permission: sender.permissions, message: chatMsg}, messageIn.timestamp).toJSON();
                    client.send(response);
                }
            });
        } catch(err) {
            Log.message(err, 'ERROR');
        }
    }
}

