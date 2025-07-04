$(document).on('click', '#logout', async () => {
    const logoutSocket = new WebSocket(`ws://${await config.get('host')}:${await config.get('port')}`);
    const sessionKey = sessionStorage.getItem('session_key');
    const loginWindow = '/index.html';

    logoutMessage = new Packet('LOGOUT', { sessionKey: sessionKey });
    gameSocket.send(logoutMessage.toJSON());
    gameSocket.close();

    sessionStorage.removeItem('current_state');
    sessionStorage.removeItem('logged_in');
    sessionStorage.removeItem('session_key');
    window.location.href = `${window.baseDir}${loginWindow}`;
});
