const { exec } = require('child_process');

const { gifski } = require('../config.json');


const [, , id] = process.argv;

let src, dest;
if (id === '1') {
    src = './out/Animation1.gif';
    dest = './out/frames/frame*.png';
} else if (id === '2') {
    src = './out/Animation2.gif';
    dest = './out/bordered/frame*.png';
}

const command = `gifski --quality ${gifski[id].quality} --fps ${gifski[id].fps} --width ${gifski[id].width} --height ${gifski[id].height} -o "${src}" ${dest}`;
exec(command, (err, stdout, stderr) => {
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