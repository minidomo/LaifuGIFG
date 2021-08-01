const Jimp = require('jimp');
const fs = require('fs');
const Util = require('./util');

const config = require('../config.json');

(async () => {
    const src = './out/resized';
    const border = await Jimp.read('./assets/border.png');
    fs.readdir(src, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        let completed = 0;
        files.filter((filename) => filename.endsWith('.png'))
            .forEach((filename, i, arr) => {
                Jimp.read(`${src}/${filename}`)
                    .then(img => {
                        const newImage = img.clone();
                        if (config.stage.border.jimpColors.length > 0) {
                            newImage.color(config.stage.border.jimpColors);
                        }
                        const newName = `frame${Util.pad(i, arr.length)}.png`;
                        newImage
                            .composite(border, 0, 0)
                            .writeAsync(`./out/bordered/${newName}`);
                        completed++;
                        Util.print(`Frame ${completed} / ${arr.length}`);
                    })
                    .catch(console.error);
            });
    });
})();