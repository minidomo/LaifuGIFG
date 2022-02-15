'use strict';

const fs = require('fs');

(() => {
    const data = fs.readFileSync('config.json.example', { encoding: 'utf-8' });
    const lines = data.split(/[\r\n]+/)
        .map(s => s.trimEnd())
        .filter(s => s.length > 0);
    const COMMENT_LINE_REGEX = /^(.+?)(?=\/{2})(.+)$/;
    /** @type {string[]} */
    let fixedLines;

    if (process.argv[2] === '--undo') {
        for (let i = lines.length - 1; i > 0; i--) {
            const line = lines[i];
            const match = line.match(COMMENT_LINE_REGEX);
            if (match && match[1].trim().length === 0) {
                const afterSlash = match[2].substring(2).trim();
                lines[i - 1] = `${lines[i - 1]} ${afterSlash}`;
                lines[i] = '';
            }
        }

        fixedLines = lines.map(line => line.trimEnd())
            .filter(line => line.length > 0);
    } else {
        let furthestNonCommentPosition = -1;
        lines.forEach(s => {
            const commentPosition = s.indexOf('//');
            furthestNonCommentPosition = Math.max(furthestNonCommentPosition, commentPosition);
        });

        fixedLines = lines.map(line => {
            let ret = line;
            const match = ret.match(COMMENT_LINE_REGEX);
            if (match) ret = `${match[1].padEnd(furthestNonCommentPosition, ' ')}${match[2]}`;
            return ret.trimEnd();
        });
    }
    const newData = fixedLines.join('\n');
    fs.writeFileSync('temp.json.example', newData, { encoding: 'utf-8' });
})();
