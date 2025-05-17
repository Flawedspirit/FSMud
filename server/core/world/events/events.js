module.exports = {
    /**
     * Fired when the server receives data from the client.
     * @event DATA_RECEIVED
     */
    'DATA_RECEIVED': true,
    /**
     * Fired when a player logs into the server.
     * @event PLAYER_CONNECTED
     * @param {Object} { string: data, WebSocket: socket }
     */
    'PLAYER_CONNECTED': true,
    /**
     * When called, saves player state.
     * @event SAVE
     */
    'SAVE': true,
    'SERVER_READY': true,
    /**
     * Fired when the client makes a connection to the server.
     * @event SOCKET_CONNECTED
     * @param {WebSocket} socket
     */
    'SOCKET_CONNECTED': true,
}