'use strict';

const { promisify } = require('util');
const { spawn } = require('child_process');
const fs = require('fs');
const Jimp = require('jimp');
const { GifUtil } = require('gifwrap');

const { Frame, GifProcessMetadata } = require('./structures');
const Constants = require('./constants');
const logger = require('./logger');
const util = require('./util');
const config = require('../config.json');

/**
 *
 * @param {string} str
 * @returns {Set<number>}
 */
const createExcludeSet = str => {
    const excludeSet = new Set();
    const partRegex = /^(\d+)$|(?:^(\d+)-(\d+)$)/;
    str.split(/\s+/)
        .map(s => s.trim())
        .filter(s => s && s.match(partRegex))
        .forEach(s => {
            const match = s.match(partRegex);
            if (match[1]) {
                excludeSet.add(parseInt(match[1]));
            } else {
                const start = parseInt(match[2]);
                const end = parseInt(match[3]);
                for (let i = start; i <= end; i++) excludeSet.add(i);
            }
        });
    return excludeSet;
};

/**
 *
 * @param {Object} data
 * @param {string} data.dirPath
 * @param {Set<number>} data.excludeSet
 * @returns {Promise<import('./structures/Frame')[]>}
 */
const readFrames = async data => {
    const files = fs.readdirSync(data.dirPath, { encoding: 'utf-8', withFileTypes: true });
    const filenames = files.filter(file => file.isFile()).map(file => file.name);

    /** @type {Promise<import('jimp')>[]} */
    const promises = [];
    filenames.forEach((filename, i) => {
        if (data.excludeSet.has(i)) {
            promises.push(null);
        } else {
            const sourcePath = `${data.dirPath}/${filename}`;
            promises.push(Jimp.read(sourcePath));
        }
    });
    const images = await Promise.all(promises);

    /** @type {import('./structures/Frame')[]} */
    const frames = [];
    const digits = String(images.length).length;
    images.forEach((image, i) => {
        if (image) {
            const id = util.padNumber(digits + 1, i);
            const originalSourcePath = `${data.dirPath}/${filenames[i]}`;
            frames.push(new Frame({ id, image, originalSourcePath }));
        }
    });
    return frames;
};

const resizeFrames = (() => {
    /**
     *
     * @param {Object} data
     * @param {import('jimp')} data.image
     * @param {string} data.destPath
     */
    const resizeImage = async data => {
        if (data.image.getWidth() !== Constants.Laifu.WIDTH) {
            data.image.resize(Constants.Laifu.WIDTH, Constants.Laifu.HEIGHT);
        }
        await data.image.writeAsync(data.destPath);
    };

    /**
     *
     * @param {Object} data
     * @param {import('./structures/Frame')[]} data.frames
     * @param {import('./structures/GifProcessMetadata')} data.metadata
     * @returns {Promise<void>}
     */
    const func = async data => {
        const promises = [];
        data.frames.forEach(frame => {
            const destPath = `${data.metadata.resizePath}/${frame.filename}`;
            promises.push(resizeImage({ image: frame.image, destPath }));
        });
        await Promise.all(promises);
    };

    return func;
})();

const colorFrames = (() => {
    /**
     * @param {Object} data
     * @param {import('jimp')} data.image
     * @param {string} data.destPath
     */
    const colorImage = async data => {
        data.image.color(config.jimpColorManipulation);
        await data.image.writeAsync(data.destPath);
    };

    /**
     *
     * @param {Object} data
     * @param {import('./structures/Frame')[]} data.frames
     * @param {import('./structures/GifProcessMetadata')} data.metadata
     * @returns {Promise<void>}
     */
    const func = async data => {
        const promises = [];
        data.frames.forEach(frame => {
            const destPath = `${data.metadata.colorPath}/${frame.filename}`;
            promises.push(colorImage({ image: frame.image, destPath }));
        });
        await Promise.all(promises);
    };

    return func;
})();

const copyFrames = (() => {
    const copyFileAsync = promisify(fs.copyFile);

    /**
     *
     * @param {Object} data
     * @param {import('./structures/Frame')[]} data.frames
     * @param {import('./structures/GifProcessMetadata')} data.metadata
     * @returns {Promise<void>}
     */
    const func = async data => {
        const promises = [];
        data.frames.forEach(frame => {
            const destPath = `${data.metadata.basePath}/${frame.filename}`;
            promises.push(copyFileAsync(frame.originalSourcePath, destPath));
        });
        await Promise.all(promises);
    };

    return func;
})();

const borderFrames = (() => {
    /**
     *
     * @param {import('./structures/Frame')} frame
     * @returns {number}
     */
    const determineTemporaryBorderColor = frame => frame.id.match(/[02468]$/) ? 0xff0000ff : 0x00ff00ff;

    /**
     * @param {Object} data
     * @param {import('./structures/Frame')} data.frame
     * @param {number} data.hexColor
     * @param {import('./structures/GifProcessMetadata')} data.metadata
     * @returns {Promise<void>}
     */
    const drawBorderFrame = async data => {
        const { frame, hexColor } = data;
        const { image } = frame;
        const borderThickness = Constants.Laifu.BORDER_THICKNESS
            + (image.getHeight() / Constants.Laifu.HEIGHT < 1.5 ? 0 : 1);
        for (let x = 0; x < image.getWidth(); x++) {
            for (let j = 0; j < borderThickness; j++) {
                image.setPixelColor(hexColor, x, j);
                image.setPixelColor(hexColor, x, image.getHeight() - 1 - j);
            }
        }
        for (let y = 0; y < image.getHeight(); y++) {
            for (let j = 0; j < borderThickness; j++) {
                image.setPixelColor(hexColor, j, y);
                image.setPixelColor(hexColor, image.getWidth() - 1 - j, y);
            }
        }
        const destPath = `${data.metadata.borderPath}/${frame.filename}`;
        await image.writeAsync(destPath);
    };

    /**
     * @param {Object} data
     * @param {import('./structures/Frame')} data.frames
     * @param {import('./structures/GifProcessMetadata')} data.metadata
     * @returns {Promise<void>}
     */
    const func = async data => {
        const promises = [];
        data.frames.forEach(frame => {
            const hexColor = determineTemporaryBorderColor(frame);
            promises.push(drawBorderFrame({ frame, hexColor, metadata: data.metadata }));
        });
        await Promise.all(promises);
    };

    return func;
})();

const recolorBorder = (() => {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    const isOnBorder = (x, y) => {
        const MAX_X_INDEX = Constants.Laifu.WIDTH - 1;
        const MAX_Y_INDEX = Constants.Laifu.HEIGHT - 1;
        const diffX = Math.min(x, Math.abs(x - MAX_X_INDEX));
        const diffY = Math.min(y, Math.abs(y - MAX_Y_INDEX));
        return diffX < 2 || diffY < 2;
    };

    /**
     *
     * @param {import('gifwrap').Gif} gif
     */
    const func = gif => {
        const fullHex = 0xff;
        gif.frames.forEach((frame, i) => {
            const buffer = frame.bitmap.data;
            frame.scanAllCoords((x, y, bi) => {
                if (isOnBorder(x, y)) {
                    if (i === 0) {
                        buffer[bi] = fullHex;
                        buffer[bi + 1] = fullHex;
                        buffer[bi + 2] = fullHex;
                        buffer[bi + 3] = fullHex;
                    } else {
                        buffer[bi + 3] = 0;
                    }
                }
            });
        });
    };

    return func;
})();

/**
 *
 * @param {import('./structures/GifProcessMetadata')} metadata
 * @returns {Promise<void>}
 */
const createGif = async metadata => {
    /** @type {import('./structures/Frame')[]} */
    let frames;
    /** @type {string} */
    let framesPath;

    const borderExcludeSet = createExcludeSet(config.frames.exclude.border);
    if (config.frames.startFrom.border) {
        framesPath = metadata.borderPath;
        frames = await readFrames({
            dirPath: framesPath,
            excludeSet: borderExcludeSet,
        });
    } else {
        const colorExcludeSet = createExcludeSet(config.frames.exclude.color);
        if (config.frames.startFrom.color) {
            framesPath = metadata.colorPath;
            frames = await readFrames({
                dirPath: framesPath,
                excludeSet: colorExcludeSet,
            });
        } else {
            const resizeExcludeSet = createExcludeSet(config.frames.exclude.resize);
            if (config.frames.startFrom.resize) {
                framesPath = metadata.resizePath;
                frames = await readFrames({
                    dirPath: framesPath,
                    excludeSet: resizeExcludeSet,
                });
            } else {
                const baseExcludeSet = createExcludeSet(config.frames.exclude.base);
                framesPath = metadata.basePath;
                if (config.frames.startFrom.base || metadata.originalGifPath) {
                    frames = await readFrames({
                        dirPath: framesPath,
                        excludeSet: baseExcludeSet,
                    });
                } else {
                    await util.clearDirectory(framesPath);
                    frames = await readFrames({
                        dirPath: config.sourcePath,
                        excludeSet: baseExcludeSet,
                    });
                    logger.info(`[${metadata.id}] Copying frames`);
                    util.time({ label: `${metadata.id}copyFrames`, type: 'set' });
                    await copyFrames({ frames, metadata });
                    logger.info(`[${metadata.id}] Copying frames: execution time=`
                        + `${util.time({ label: `${metadata.id}copyFrames`, type: 'get' })} second(s)`);
                }

                if (config.frames.resizePrior) {
                    frames = frames.filter(f => !resizeExcludeSet.has(parseInt(f.id)));
                    framesPath = metadata.resizePath;
                    await util.clearDirectory(framesPath);
                    logger.info(`[${metadata.id}] Resizing frames`);
                    util.time({ label: `${metadata.id}resizeFrames`, type: 'set' });
                    await resizeFrames({ frames, metadata });
                    logger.info(`[${metadata.id}] Resizing frames: execution time=`
                        + `${util.time({ label: `${metadata.id}resizeFrames`, type: 'get' })} second(s)`);
                }
            }

            if (config.jimpColorManipulation.length > 0) {
                frames = frames.filter(f => !colorExcludeSet.has(parseInt(f.id)));
                framesPath = metadata.colorPath;
                await util.clearDirectory(framesPath);
                logger.info(`[${metadata.id}] Applying jimp colors to frames`);
                util.time({ label: `${metadata.id}colorFrames`, type: 'set' });
                await colorFrames({ frames, metadata });
                logger.info(`[${metadata.id}] Coloring frames: execution time=`
                    + `${util.time({ label: `${metadata.id}colorFrames`, type: 'get' })} second(s)`);
            }
        }

        frames = frames.filter(f => !borderExcludeSet.has(parseInt(f.id)));
        framesPath = metadata.borderPath;
        await util.clearDirectory(framesPath);
        logger.info(`[${metadata.id}] Applying a temporary border to frames`);
        util.time({ label: `${metadata.id}borderFrames`, type: 'set' });
        await borderFrames({ frames, metadata });
        logger.info(`[${metadata.id}] Bordering frames: execution time=`
            + `${util.time({ label: `${metadata.id}borderFrames`, type: 'get' })} second(s)`);
    }

    logger.info(`[${metadata.id}] generating temporary gif`);
    const fps = metadata.fps ?? config.gifskiSettings.fps;
    const gifskiArgs = `-Q ${config.gifskiSettings.quality} -r ${fps} -W ${Constants.Laifu.WIDTH}`
        + ` -H ${Constants.Laifu.HEIGHT} --nosort -o ${metadata.tempGifPath} ${framesPath}/frame*.png`;
    const gifski = spawn(config.executablePath.gifski, gifskiArgs.split(/\s+/));
    gifski.stdout.on('data', gifskiData => util.logAllLines(`${gifskiData}`, logger.info.bind(logger)));
    gifski.stderr.on('data', gifskiData => util.logAllLines(`${gifskiData}`, logger.error.bind(logger)));
    gifski.on('close', async code => {
        logger.info(`[${metadata.id}] gifski exit code: ${code}`);

        if (code === 0) {
            const gif = await GifUtil.read(metadata.tempGifPath);
            logger.info(`[${metadata.id}] Recoloring border to white`);
            util.time({ label: `${metadata.id} recolorBorder`, type: 'set' });
            recolorBorder(gif);
            logger.info(`[${metadata.id}] Recoloring border: execution time=`
                + `${util.time({ label: `${metadata.id} recolorBorder`, type: 'get' })} second(s)`);
            await GifUtil.write(metadata.finalGifPath, gif.frames, gif);
            logger.info(`[${metadata.id}] Wrote gif to ${metadata.finalGifPath}`);
        }
    });
};

/**
 *
 * @param {import('./structures/GifProcessMetadata')} metadata
 * @returns {Promise<void>}
 */
const recreateGif = async metadata => {
    await util.clearDirectory(metadata.basePath);

    logger.info(`[${metadata.id}] exporting frames from original gif`);
    const ffmpegArgs = `-i ${metadata.originalGifPath} ${metadata.basePath}/frame%04d.png`;
    const ffmpeg = spawn(config.executablePath.ffmpeg, ffmpegArgs.split(/\s+/));
    ffmpeg.stdout.on('data', ffmpegData => util.logAllLines(`${ffmpegData}`, logger.info.bind(logger)));
    ffmpeg.stderr.on('data', ffmpegData => {
        const str = `${ffmpegData}`;
        util.logAllLines(str, logger.info.bind(logger));

        if (config.fixSettings.keepOriginalFps) {
            const tbrRegex = /(\d+) tbr,/;
            const match = str.match(tbrRegex);
            if (match) {
                metadata.fps = parseInt(match[1]);
            }
        }
    });
    ffmpeg.on('close', code => {
        logger.info(`[${metadata.id}] ffmpeg exit code: ${code}`);

        if (code === 0) {
            createGif(metadata);
        }
    });
};

/**
 *
 * @param {string} dirPath
 */
const recreateGifs = dirPath => {
    const files = fs.readdirSync(dirPath, { encoding: 'utf-8', withFileTypes: true });
    const filenames = files.filter(file => file.isFile()).map(file => file.name);

    filenames.forEach((filename, i) => {
        const gifPath = `${dirPath}/${filename}`;
        recreateGif(new GifProcessMetadata({ id: `${i}`, originalGifPath: gifPath }));
    });
};

(() => {
    switch (config.mode) {
        case 'new': {
            createGif(new GifProcessMetadata({ id: '' }));
            break;
        }
        case 'fix': {
            recreateGif(new GifProcessMetadata({ id: '', originalGifPath: config.sourcePath }));
            break;
        }
        case 'mass-fix': {
            recreateGifs(config.sourcePath);
            break;
        }
        default: {
            logger.error(`'mode' in config.json must be set to one of the following: new, fix, mass-fix`);
            break;
        }
    }
})();
