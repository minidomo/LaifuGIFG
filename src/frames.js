const fs = require('fs');
const Jimp = require('jimp');
const util = require('./util');

const config = require('../config.json');

(() => {
    const FILE_REGEX = /Image \((\d+)\) (\d+)\.png/;
    fs.readdir(config.src, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        const oldnames = files
            .sort((a, b) => {
                const [, id1, num1] = FILE_REGEX.exec(a);
                const [, id2, num2] = FILE_REGEX.exec(b);
                if (id1 === id2) {
                    return parseInt(util.removePad(num1)) - parseInt(util.removePad(num2));
                }
                return parseInt(id1) - parseInt(id2);
            });
        let completed = 0;
        const modify = false;
        oldnames.forEach((oldname, i) => {
            const newname = `frame${util.pad(i, oldnames.length)}`;
            if (modify) {
                Jimp.read(`${config.src}/${oldname}`)
                    .then(img => {
                        img
                            .color([
                                { apply: 'saturate', params: [10] },
                                { apply: 'lighten', params: [5] },
                            ])
                            .writeAsync(`${config.dest}/${newname}.png`);
                        completed++;
                        util.print(10, `${completed} / ${oldnames.length}`);
                    })
                    .catch(console.error);
            } else {
                fs.copyFileSync(`${config.src}/${oldname}`, `${config.dest}/${newname}.png`);
            }
        });
    });
})();