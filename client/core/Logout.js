$(document).on('click', '#logout', async () => {
    const logoutSocket = new WebSocket(`ws://${await config.get('host')}:${await config.get('port')}`);
    const sessionKey = localStorage.getItem('session_key');
    const loginWindow = '/index.html';
    let baseDir = config.get('base_dir');
    if(baseDir === ".") baseDir = "";

    loginMessage = new Packet('LOGOUT', { sessionKey: sessionKey });

    logoutSocket.onopen = () => {
        logoutSocket.send(logoutMessage.toJSON());
        logoutSocket.close();
    };

    sessionStorage.removeItem('current_state');
    sessionStorage.removeItem('logged_in');
    sessionStorage.removeItem('session_key');
    window.location.href = `${baseDir}${loginWindow}`;
});
