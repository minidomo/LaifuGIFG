const config = require('../config.json');

const src = config.dirs.originalGif;
const { exec } = require('child_process');
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