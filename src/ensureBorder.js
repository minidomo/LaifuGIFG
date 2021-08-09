const { GifUtil } = require('gifwrap');

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
const isOnBorder = (x, y) => {
    const MAX_X_INDEX = 224;
    const MAX_Y_INDEX = 349;
    const diffX = Math.min(x, Math.abs(x - MAX_X_INDEX));
    const diffY = Math.min(y, Math.abs(y - MAX_Y_INDEX));
    return diffX < 2 || diffY < 2;
};

const PIXEL_COUNT = 78750;

GifUtil
    .read('./out/Animation1.gif')
    .then(inputGif => {
        inputGif.frames.forEach((frame, i) => {
            const buf = frame.bitmap.data;
            let count = 0;
            frame.scanAllCoords((x, y, bi) => {
                count++;
                if (isOnBorder(x, y)) {
                    if (i === 0) {
                        buf[bi] = 0xff;
                        buf[bi + 1] = 0xff;
                        buf[bi + 2] = 0xff;
                        buf[bi + 3] = 0xff;
                    } else {
                        buf[bi + 3] = 0;
                    }
                }
            });
            if (count !== PIXEL_COUNT) {
                console.log(`Frame ${i}: pixel count not equal : ${count}`);
            }
        });
        GifUtil.write('./out/Animation2.gif', inputGif.frames, inputGif);
    });