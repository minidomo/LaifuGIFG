const fs = require('fs');
const Jimp = require('jimp');
const Util = require('./util');

const config = require('../config.json');

(() => {
    const FILE_REGEX = /Image \((\d+)\) (\d+)\.png/;
    const src = config.dirs.originalFrames;
    fs.readdir(src, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        const oldNames = files
            .filter((filename) => FILE_REGEX.test(filename))
            .sort((a, b) => {
                const [, id1, num1] = FILE_REGEX.exec(a);
                const [, id2, num2] = FILE_REGEX.exec(b);
                if (id1 === id2) {
                    return parseInt(Util.removePad(num1)) - parseInt(Util.removePad(num2));
                }
                return parseInt(id1) - parseInt(id2);
            });
        let completed = 0;
        oldNames.forEach((oldName, i) => {
            const newName = `frame${Util.pad(i, oldNames.length)}.png`;
            const oldPath = `${src}/${oldName}`;
            const newPath = `./out/frames/${newName}`;
            if (config.stage.frames.jimpColors.length > 0) {
                Jimp.read(oldPath)
                    .then(img => {
                        img
                            .color(config.stage.frames.jimpColors)
                            .writeAsync(newPath)
                            .then(() => {
                                completed++;
                                Util.print(`Frame ${completed} / ${oldNames.length}`);
                            })
                    })
                    .catch(console.error);
            } else {
                fs.copyFile(oldPath, newPath, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    completed++;
                    Util.print(`Frame ${completed} / ${oldNames.length}`);
                });
            }
        });
    });
})();