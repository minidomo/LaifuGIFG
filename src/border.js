const Jimp = require('jimp');
const fs = require('fs');
const util = require('./util');

(async () => {
    const src = `${__dirname}/../out/resized`;
    const borderSrc = `${__dirname}/../assets/border.png`;
    const border = await Jimp.read(borderSrc);
    fs.readdir(src, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        let completed = 0;
        const modify = false;
        const borderFix = false;
        files.forEach((filename, i, arr) => {
            Jimp.read(`${src}/${filename}`)
                .then(img => {
                    let newimage = img.clone();
                    if (modify) {
                        newimage
                            .color([
                                { apply: 'saturate', params: [1] },
                                { apply: 'lighten', params: [10] },
                                // { apply: 'desaturate', params: [100] },
                            ]);
                    }
                    const name = `frame${util.pad(i, arr.length)}.png`;
                    if (borderFix) {
                        newimage
                            .composite(border, 0, 0)
                            .writeAsync(`${__dirname}/../out/bordered/${name}`);
                    } else {
                        border.clone()
                            .composite(newimage, 2, 2)
                            .writeAsync(`${__dirname}/../out/bordered/${name}`);
                    }
                    completed++;
                    util.print(10, `${completed} / ${arr.length}`);
                })
                .catch(console.error);
        });
    });
})();