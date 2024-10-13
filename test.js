const { mp4ToGif } = require("./mp42gif");

const inputPath = process.argv[2];
const customFrameRate = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;
const speedMultiplier = process.argv[4] ? parseFloat(process.argv[4]) : undefined;
const compressionLevel = process.argv[5] ? parseInt(process.argv[5], 10) : undefined;
mp4ToGif(inputPath, customFrameRate, speedMultiplier, compressionLevel);
