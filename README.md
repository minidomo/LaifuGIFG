# LaifuGIFG
A script designed for the purpose of creating/adjusting GIFs from series of images/existing GIFs for the bot, [LaifuBot](https://www.laifubot.xyz/), on Discord.

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [GIFski](https://GIF.ski/)
- [FFmpeg](https://ffmpeg.org/download.html)

## Features
- Generate a GIF from a series of images
- Generate a new GIF from an existing GIF
- Generate multiple GIFs from a series of existing GIFs at once
- Customizability with options such as applying color changes, adjusting fps, and modifying encoding quality of generated GIFs

## Usage
1. Have a copy of this repository on your local computer.
    - Download a copy of this repository or clone the repository using git:
        ```
        git clone https://github.com/minidomo/LaifuGIFG.git
        ```
2. Install dependencies
    - In the command line, enter into this directory and type the following command to install dependencies:
        ```
        npm install
        ```
3. Adjust config.json
    - An example is provided, config.json.example, create a copy or remove the .example extension to have a config.json file.
    - Read the provided example file to understand the availability of options to configure the generation of GIFs. 
        > Make sure to remove any comments existing in your config.json if referencing config.json.example
4. Generate the GIF(s)
    - After configuring config.json, type the following command to run the script to generate the GIF(s) in a generated folder, `out`:
        ```
        npm run start
        ```
5. Empty the `out` directory
    - Run the following script to empty the `out` directory and put contents into the recycling bin:
        ```
        npm run clean
        ```

## Stages
To utilize config.json effectively, it is important to understand the stages of the script and the order in which they occur. When generating GIFs, the script enters the following stages in the given order for each GIF:
1. Base
    - Produces copies of the frames from series of images or an existing GIF in `out/temp*/base`.
2. Resize
    - Resizes frames located in `out/temp*/base` and outputs frames to `out/temp*/resize`.
    - Optional. Enters this stage if `resizePrior` is `true` in config.json.
3. Color
    - Applies color changes to frames from the previous stage and outputs frames to `out/temp*/color`.
    - Optional. Enters this stage if `jimpColorManipulation` is a non-empty array.
4. Border
    - Applies a temporary border to frames from the previous stage and outputs frames to `out/temp*/border`.
5. First GIF Generation
    - Generates the first GIF using frames located in `out/temp*/border` and outputs it to `out/temp*/Animation.GIF`.
6. Final GIF Generation
    - Recolors the border of the first GIF to white and outputs it to `out/Animation*.GIF`.

## Supplemental Information
- [LaifuBot GIF Making Process](https://gist.github.com/minidomo/fcb6870ad4778f10b43ab8fbe24833f9) by me
- [LaifuBot Slide Making Process](https://gist.github.com/minidomo/aec3123591b7051c922f1b2c6267291a) by me
