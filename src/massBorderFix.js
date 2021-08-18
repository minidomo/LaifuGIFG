const fs = require('fs');
const { exec } = require('child_process');

const config = require('../config.json');
const util = require('./util');

fs.readdirSync(config.dirs.massBorderFixGifs, { encoding: 'utf-8', withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.gif'))
    .map(f => f.name)
    .forEach(name => {
        config.dirs.originalGif = `${config.dirs.massBorderFixGifs}/${name}`;
        util.saveConfig(config);
        exec('npm run start:borderFix', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.log(stderr);
            }
        }).once('exit', () => {
            fs.copyFile('./out/Animation2.gif', `./out/borderFixes/${name}`, err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
    });