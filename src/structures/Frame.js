'use strict';

class Frame {
    /**
     *
     * @param {Object} data
     * @param {string} data.id
     * @param {import('jimp')} data.image
     * @param {string} data.originalSourcePath
     */
    constructor(data = {}) {
        if (typeof data.id === 'undefined') throw new Error('id cannot be missing');
        if (typeof data.image === 'undefined') throw new Error('image cannot be missing');
        if (typeof data.originalSourcePath === 'undefined') throw new Error('originalSourcePath cannot be missing');
        if (!data.id.match(/^\d+$/)) throw new Error('id must consist entirely of digits');
        /**
         * @type {string}
         */
        this.id = data.id;
        /**
         * @type {import('jimp')}
         */
        this.image = data.image;
        /**
         * @type {string}
         */
        this.originalSourcePath = data.originalSourcePath;
    }

    /**
     * @returns {string}
     */
    get filename() {
        return `frame${this.id}.png`;
    }
}

module.exports = Frame;
