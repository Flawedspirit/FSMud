global.BASEDIR = __dirname;
global.baseRequire = path => require(BASEDIR + '/' + path);

const World = require('./server/core/world');
World.init();
