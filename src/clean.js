const fs = require('fs');

/**
 * 
 * @param {string} dirName 
 */
const deletePngs = (dirName) => {
    fs.readdir(dirName, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        files.forEach((filename) => {
            const newName = `${dirName}/${filename}`;
            fs.lstat(newName, (err, stats) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (stats.isDirectory()) {
                    deletePngs(newName);
                } else if (filename.endsWith('.png')) {
                    fs.unlink(newName, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            })
        });
    });
};

deletePngs('./out');