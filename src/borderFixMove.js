const fs = require('fs');
const Util = require('./util');

const config = require('../config.json');

(() => {
    const FILE_REGEX = /frame\d+.png/;
    const src = config.dirs.originalFrames;
    fs.readdir(src, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        let completed = 0;
        files
            .filter((filename) => FILE_REGEX.test(filename))
            .forEach((filename, i, arr) => {
                fs.copyFile(`${src}/${filename}`, `./out/resized/${filename}`, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    completed++;
                    Util.print(`Frame ${completed} / ${arr.length}`);
                });
            });
    });
})();