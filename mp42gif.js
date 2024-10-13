const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

function mp4ToGif(inputPath, customFrameRate, speedMultiplier, compressionLevel) {
    if (!inputPath) {
        console.error(JSON.stringify({ error: 'Input path is required' }));
        return;
    }

    const outputPath = path.resolve(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.gif');

    ffmpeg.ffprobe(inputPath, function(err, metadata) {
        if (err) {
            console.error(JSON.stringify({ error: 'Error retrieving metadata', details: err }));
            return;
        }

        let frameRate = customFrameRate || eval(metadata.streams[0].r_frame_rate);
        if (speedMultiplier) {
            frameRate *= speedMultiplier;
        }
        const width = metadata.streams[0].width;
        const height = metadata.streams[0].height;
        const compression = compressionLevel !== undefined ? compressionLevel : 0;
        const duration = metadata.format.duration;

        // Adjust settings based on clip length
        if (duration <= 5) {
            frameRate = Math.min(frameRate, 10); // Lower frame rate for short clips
        } else if (duration <= 10) {
            frameRate = Math.min(frameRate, 15); // Medium frame rate for medium clips
        } else if (duration <= 20) {
            frameRate = Math.min(frameRate, 20); // Higher frame rate for longer clips
        } else if (duration <= 30) {
            frameRate = Math.min(frameRate, 25); // Even higher frame rate for longer clips
        } else if (duration <= 60) {
            frameRate = Math.min(frameRate, 30); // Highest frame rate for clips up to 1 minute
        } else {
            frameRate = Math.min(frameRate, 35); // Maximum frame rate for clips longer than 1 minute
        }

        // Convert the MP4 to GIF with optimized settings for highest quality
        ffmpeg(inputPath)
            .outputOptions([
                `-vf`, `fps=${frameRate},scale=${width}:${height}:flags=lanczos`,
                '-gifflags', '+transdiff',
                '-y',
                '-compression_level', compression,
                '-q:v', '2', // Highest quality
                '-preset', 'veryslow', // Best quality preset
                '-pix_fmt', 'rgb24' // Ensure highest color quality
            ])
            .toFormat('gif')
            .on('end', function() {
                console.log(JSON.stringify({ outputPath: outputPath }));
            })
            .on('error', function(err) {
                console.error(JSON.stringify({ error: 'Error during conversion', details: err }));
            })
            .save(outputPath);
    });
}

module.exports = { mp4ToGif }