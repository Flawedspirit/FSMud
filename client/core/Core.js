window.config = new Config();

jq(document).ready(async () => {
    // Load game client configuration
    await config.loadConfig();

    // Handle session connection
    const sessionKey = sessionStorage.getItem('session_key');
    const loggedIn = sessionStorage.getItem('logged_in');
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

    currentState = JSON.parse(sessionStorage.getItem('current_state'));
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
});