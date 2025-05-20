window.config = new Config();

async function connect() {
    window.gameSocket = new WebSocket(`ws://${await config.get('host')}:${await config.get('port')}`);

    gameSocket.onopen = () => {
        console.log("Connected!");
        $(document).trigger('SOCKET_READY');
    };

    gameSocket.onerror = (error) => {
        $('#login_messages').empty();
        $('#login_messages').removeClass('d-none');
        $('#login_messages').append('<p class="mb-0">Unable to reach login server. Please try again later.</p>');
    }

    gameSocket.onclose = () => {
        console.log("Connected closed by server.");
        if(sessionStorage.getItem('logged_in')) {
            sessionStorage.removeItem('current_state');
            sessionStorage.removeItem('logged_in');
            sessionStorage.removeItem('session_key');
            window.location.href = `${baseDir}/index.html`;
        }
    }
}

$(document).ready(async () => {
    // Load game client configuration
    await config.loadConfig();

    window.baseDir = config.get('base_dir');
    if(window.baseDir === ".") window.baseDir = "";

    await connect();

    // Handle session connection
    window.sessionKey = sessionStorage.getItem('session_key');
    window.loggedIn = sessionStorage.getItem('logged_in');
    let baseDir = config.get('base_dir');
    if(baseDir === ".") baseDir = "";

    const currentWindow = window.location.pathname;
    const gameWindow = '/game.html';

    if(sessionKey && !loggedIn) {
        sessionStorage.setItem('logged_in', 'true');

        if(currentWindow !== `${baseDir}${gameWindow}`) {
            window.location.href = `${baseDir}${gameWindow}`;
        }
    }

    if(loggedIn && currentWindow !== `${baseDir}${gameWindow}`) {
        window.location.href = `${baseDir}${gameWindow}`;
    }

    window.currentState = JSON.parse(sessionStorage.getItem('current_state'));
    if(currentState) {
        const username = currentState.name;
        const level = currentState.level;
        const race = currentState.race;
        const strength = currentState.attributes.strength;
        const vitality = currentState.attributes.vitality;
        const agility = currentState.attributes.agility;
        const willpower = currentState.attributes.willpower;
        const perception = currentState.attributes.perception;

        $('#loggedInUser').text(username);
        $('#player__name').text(username);
        $('#player__level').text(level);
        $('#player__race').text(race);
        $('#player__str').text(strength);
        $('#player__vit').text(vitality);
        $('#player__agi').text(agility);
        $('#player__wil').text(willpower);
        $('#player__per').text(perception);

        const permissionLevel = currentState.permissions;
        switch(parseInt(permissionLevel)) {
            case 2:
                $('#player__name').addClass('is-admin');
                break;
            case 1:
                $('#player__name').addClass('is-mod');
                break;
        }
    }

    // Automatically scroll chatbox to bottom
    const chatbox = $('#messageArea')[0];

    if(chatbox) {
        const observer = new MutationObserver(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        });

        observer.observe(chatbox, { childList: true, subtree: true });
    }
});