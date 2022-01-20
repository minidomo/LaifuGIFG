'use strict';

const fs = require('fs');

/**
 *
 * @param {string} path
 */
const ensurePathExists = path => {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
};

class GifProcessMetadata {
    /**
     *
     * @param {Object} data
     * @param {string} data.id
     * @param {number=} data.fps
     * @param {string=} data.originalGifPath
     */
    constructor(data = {}) {
        if (typeof data.id === 'undefined') throw new Error('id cannot be missing');
        /** @type {string} */
        this.id = data.id;
        /** @type {number|null} */
        this.fps = data.fps ?? null;
        /** @type {string|null} */
        this.originalGifPath = data.originalGifPath ?? null;

        ensurePathExists(this.basePath);
        ensurePathExists(this.resizePath);
        ensurePathExists(this.colorPath);
        ensurePathExists(this.borderPath);
    }

    get basePath() {
        return `out/temp${this.id}/base`;
    }

    get resizePath() {
        return `out/temp${this.id}/resize`;
    }

    get colorPath() {
        return `out/temp${this.id}/color`;
    }

    get borderPath() {
        return `out/temp${this.id}/border`;
    }

    get tempGifPath() {
        return `out/temp${this.id}/Animation.gif`;
    }

    get finalGifPath() {
        return `out/Animation${this.id}.gif`;
    }
}

module.exports = GifProcessMetadata;
