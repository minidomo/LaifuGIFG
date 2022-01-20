'use strict';

const fs = require('fs');

(() => {
    const data = fs.readFileSync('config.json.example', { encoding: 'utf-8' });
    const lines = data.split(/[\r\n]+/)
        .map(s => s.trimEnd())
        .filter(s => s.length > 0);

    let furthestNonCommentPosition = -1;
    lines.forEach(s => {
        const commentPosition = s.indexOf('//');
        furthestNonCommentPosition = Math.max(furthestNonCommentPosition, commentPosition);
    });

    const fixedLines = lines.map(s => {
        let ret = s;
        const commentPosition = s.indexOf('//');
        if (commentPosition >= 0) {
            const nonComment = s.substring(0, commentPosition);
            const comment = s.substring(commentPosition);
            ret = `${nonComment.padEnd(furthestNonCommentPosition, ' ')}${comment}`;
        }
        return ret.trimEnd();
    });

    const newData = fixedLines.join('\n');
    fs.writeFileSync('temp.json.example', newData, { encoding: 'utf-8' });
})();
