const multipart = require('multipart-formdata');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     description: Uploads a single file to the local uploads directory
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 path:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
module.exports = async function (context, req) {
    try {
        if (!req.body || !req.headers['content-type']) {
            return {
                status: 400,
                body: "Please provide a file in the request body"
            };
        }

        // Parse the multipart form data
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.parse(req.body, boundary);
        const filePart = parts.find(part => part.type === 'file');

        if (!filePart) {
            return {
                status: 400,
                body: "No file found in the request"
            };
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileName = `${Date.now()}-${filePart.filename}`;
        const filePath = path.join(uploadsDir, fileName);

        // Write the file
        await fs.writeFile(filePath, filePart.data);

        return {
            status: 200,
            body: {
                message: "File uploaded successfully",
                fileName: fileName,
                path: `/uploads/${fileName}`
            }
        };
    } catch (error) {
        context.log.error('Error uploading file:', error);
        return {
            status: 500,
            body: `Error uploading file: ${error.message}`
        };
    }
};
