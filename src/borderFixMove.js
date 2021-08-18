const config = require('../config.json');

const src = config.dirs.originalGif;
const { exec } = require('child_process');
const fs = require('fs');
exec(`ffmpeg -i "${src}" ./out/resized/frame%04d.png`, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log(stderr);
    }
});

exec(`ffprobe "${src}"`, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.log(stderr);
        const tbrText = stderr
            .split(/[\r\n]+/)
            .find(line => line.includes('tbr'))
            .split(',')
            .find(e => e.includes('tbr'))
            .trim();
        const tbr = parseFloat(tbrText.substring(0, tbrText.length - 4));
        config.gifski[2].fps = tbr;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
    }
});