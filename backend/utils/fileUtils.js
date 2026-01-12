
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Saves a base64 string as a file on disk.
 * @param {string} base64String 
 * @param {string} subDir e.g. 'courses/posters'
 * @returns {string} The full server URL of the saved file.
 */
const saveBase64Image = (base64String, subDir) => {
    if (!base64String || !base64String.startsWith('data:image')) {
        return base64String; // Return as is if already a URL or empty
    }

    const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format.');
    }

    const imageType = matches[1].split('+')[0].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filename = `${uuidv4()}.${imageType}`;

    const uploadDir = path.join(__dirname, '..', 'uploads', subDir);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imagePath = path.join(uploadDir, filename);
    fs.writeFileSync(imagePath, imageBuffer);

    const serverBaseUrl = process.env.SERVER_BASE_URL || `https://admin.creatorguru.in`;
    return `${serverBaseUrl}/uploads/${subDir}/${filename}`;
};

/**
 * Deletes a file from the disk if it exists and belongs to the local uploads directory.
 * @param {string} fileUrl 
 */
const deleteFileByUrl = (fileUrl) => {
    if (!fileUrl) return;
    
    const serverBaseUrl = process.env.SERVER_BASE_URL || `https://admin.creatorguru.in`;
    if (!fileUrl.startsWith(serverBaseUrl)) return; // Don't try to delete external URLs

    try {
        const relativePath = fileUrl.replace(`${serverBaseUrl}/`, '');
        const fullPath = path.join(__dirname, '..', relativePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(`Failed to delete file: ${fileUrl}`, error);
    }
};

module.exports = { saveBase64Image, deleteFileByUrl };
