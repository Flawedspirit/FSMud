$(document).on('submit', async (event) => {
    event.preventDefault();

    const username = $('#login-user').val();
    const password = $('#login-pass').val();
    const getip = await fetch('https://api.ipify.org?format=json');
    const data = await getip.json();
    const ip = data.ip;
    const gameWindow = '/game.html';

    let baseDir = config.get('base_dir');
    if(baseDir === ".") baseDir = "";

    const loginSocket = new WebSocket(`ws://${await config.get('host')}:${await config.get('port')}`);

    loginSocket.onopen = () => {
        console.log("Connected!");
        loginMessage = new Packet('LOGIN', { username: username, password: password, ipAddress: ip, locale: 0 });
        loginSocket.send(loginMessage.toJSON());
    };

    loginSocket.onmessage = (event) => {
        const response = Packet.fromJSON(event.data.toString());
        console.log(response);

        if(response.data.success) {
            $('#login_messages').empty();
            $('#login_messages').addClass('d-none');
            sessionStorage.setItem('session_key', response.data.message[0]);
            sessionStorage.setItem('current_state', JSON.stringify(response.data.message[1]));
            loginSocket.close();

            window.location.href = `${baseDir}${gameWindow}`;
        } else {
            $('#login_messages').empty();
            $('#login_messages').removeClass('d-none');
            if(response.data.message[0] && response.data.message[0] === 'ACCOUNT_LOCKED') {
                $('#login_messages').append('<p class="mb-0">Your account has been disabled for major rule-breaking. You can find the game rules HERE (this will eventually be a link).</p>');
            } else if(response.data.message[0] && response.data.message[0] === 'ACCOUNT_THROTTLED') {
                $('#login_messages').append(`<p class="mb-0">Your account is temporarily locked out because of too many invalid login requests. Try again in ${response.data.message[1]} seconds.</p>`);
            } else if(response.data.message[0] && response.data.message[0] === 'IP_LOCKED') {
                $('#login_messages').append('<p class="mb-0">Your IP address has been prevented from accessing the game.</p>');
            } else {
                $('#login_messages').append('<p class="mb-0">Unable to log in. Please check that your username and password are correct.</p>');
            }
        }
    }

    loginSocket.onerror = (error) => {
        console.log(error);
        $('#login_messages').empty();
        $('#login_messages').removeClass('d-none');
        $('#login_messages').append('<p class="mb-0">Unable to reach login server. Please try again later.</p>');
    }
});