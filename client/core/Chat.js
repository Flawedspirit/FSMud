$(document).on('SOCKET_READY', () => {
    const message = $('#chat_in');
    const chatArea = $('#messageArea');

    if(window.gameSocket && window.gameSocket.readyState === WebSocket.OPEN) {
        gameSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const username = data.data.username;
            const message = data.data.message;
            const permission = data.data.permission;
            const timestamp = data.timestamp;

            let permClass;
            switch(parseInt(permission)) {
                case 2:
                    permClass = 'is-admin';
                    break;
                case 1:
                    permClass = 'is-mod';
                    break;
            }

            chatArea.append(`<div id="msg_${username}_${timestamp}"><span class="${permClass}"><strong>${username}:</strong></span> ${message}</div>`);
        }
    }

    $('#chat').on('submit', async (event) => {
        event.preventDefault();

        if(window.gameSocket || window.gameSocket.readyState === WebSocket.OPEN) {
            if(message.val()) {
                chatMessage = new Packet('MESSAGE', { sender: window.currentState.id, message: message.val() });
                gameSocket.send(chatMessage.toJSON());
                message.val('');
            }
        } else {
            console.error('Websocket is not ready yet!');
        }
    });
});