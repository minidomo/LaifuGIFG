const fs = require('fs');
const { execSync } = require('child_process');

const config = require('../config.json');
const util = require('./util');

fs.readdirSync(config.dirs.massBorderFixGifs, { encoding: 'utf-8', withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.gif'))
    .map(f => f.name)
    .forEach(name => {
        config.dirs.originalGif = `${config.dirs.massBorderFixGifs}/${name}`;
        util.saveConfig(config);
        execSync('npm run start:borderFix');
        fs.copyFileSync('./out/Animation2.gif', `./out/borderFixes/${name}`);
    });