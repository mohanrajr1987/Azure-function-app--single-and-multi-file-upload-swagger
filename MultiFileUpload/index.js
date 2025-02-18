const multipart = require('multipart-formdata');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Uploads multiple files to the local uploads directory
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       originalName:
 *                         type: string
 *                       uploadedName:
 *                         type: string
 *                       path:
 *                         type: string
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
                body: "Please provide files in the request body"
            };
        }

        // Parse the multipart form data
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.parse(req.body, boundary);
        const fileParts = parts.filter(part => part.type === 'file');

        if (fileParts.length === 0) {
            return {
                status: 400,
                body: "No files found in the request"
            };
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Upload all files
        const uploadResults = await Promise.all(fileParts.map(async (filePart) => {
            const fileName = `${Date.now()}-${filePart.filename}`;
            const filePath = path.join(uploadsDir, fileName);
            
            await fs.writeFile(filePath, filePart.data);
            
            return {
                originalName: filePart.filename,
                uploadedName: fileName,
                path: `/uploads/${fileName}`
            };
        }));

        return {
            status: 200,
            body: {
                message: "Files uploaded successfully",
                files: uploadResults
            }
        };
    } catch (error) {
        context.log.error('Error uploading files:', error);
        return {
            status: 500,
            body: `Error uploading files: ${error.message}`
        };
    }
};
