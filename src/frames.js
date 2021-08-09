const fs = require('fs');
const Jimp = require('jimp');
const Util = require('./util');

const config = require('../config.json');

(() => {
    const FILE_REGEX = /Image \((\d+(?:\.\d+)?)\) (\d+)\.png/;
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
                    return parseFloat(Util.removePad(num1)) - parseFloat(Util.removePad(num2));
                }
                return parseFloat(id1) - parseFloat(id2);
            });
        let completed = 0;
        oldNames.forEach((oldName, i) => {
            const newName = `frame${Util.pad(i, oldNames.length)}.png`;
            const oldPath = `${src}/${oldName}`;
            const newPath = `./out/frames/${newName}`;
            Jimp
                .read(oldPath)
                .then(img => {
                    if (config.stage.frames.jimpColors.length > 0) {
                        img.color(config.stage.frames.jimpColors);
                    }
                    const borderThickness = 3;
                    const color = i % 2 ? 0xff0000ff : 0x00ff00ff;
                    for (let x = 0; x < img.getWidth(); x++) {
                        for (let j = 0; j < borderThickness; j++) {
                            img.setPixelColor(color, x, j);
                            img.setPixelColor(color, x, img.getHeight() - 1 - j);
                        }
                    }
                    for (let y = 0; y < img.getHeight(); y++) {
                        for (let j = 0; j < borderThickness; j++) {
                            img.setPixelColor(color, j, y);
                            img.setPixelColor(color, img.getWidth() - 1 - j, y);
                        }
                    }
                    img.writeAsync(newPath)
                    completed++;
                    Util.print(`Frame ${completed} / ${oldNames.length}`);
                })
                .catch(console.error);

            // fs.copyFile(oldPath, newPath, (err) => {
            //     if (err) {
            //         console.error(err);
            //         return;
            //     }
            //     completed++;
            //     Util.print(`Frame ${completed} / ${oldNames.length}`);
            // });
        });
    });
})();