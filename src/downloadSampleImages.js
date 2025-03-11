const fs = require('fs');
const https = require('https');

const images = [
    // Scania R1000 images
    {
        url: 'https://ets2.lt/wp-content/uploads/2024/03/Volvo-F-Series-Rigid-BDF-v1.49-1-555x312.jpg ',
        filename: 'scania-r1000-1.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2024/03/Volvo-F-Series-Rigid-BDF-v1.49-3-555x312.jpg ',
        filename: 'scania-r1000-2.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-1-555x304.jpg ',
        filename: 'scania-r1000-3.jpg'
    },

    // Volvo FH16 images
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'volvo-fh16-1.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'volvo-fh16-2.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'volvo-fh16-3.jpg'
    },

    // DAF XG+ images
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'daf-xg-1.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'daf-xg-2.jpg'
    },
    {
        url: 'https://ets2.lt/wp-content/uploads/2025/03/Scania-Next-Generation-2019-v1.0-3-555x268.jpg ',
        filename: 'daf-xg-3.jpg'
    }
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        // Ensure uploads directory exists
        if (!fs.existsSync('public/uploads')) {
            fs.mkdirSync('public/uploads', { recursive: true });
        }

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(`public/uploads/${filename}`);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(`Failed to download ${url}`);
            }
        }).on('error', reject);
    });
};

const downloadAllImages = async () => {
    try {
        for (const image of images) {
            await downloadImage(image.url, image.filename);
            console.log(`Downloaded ${image.filename}`);
        }
        console.log('All images downloaded successfully!');
    } catch (err) {
        console.error('Error downloading images:', err);
    }
};

downloadAllImages(); 