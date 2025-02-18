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
    context.log('Processing single file upload request');
    context.log('Headers:', JSON.stringify(req.headers));
    
    try {
        if (!req.body || !req.headers['content-type']) {
            context.log('No request body or content-type header');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: { error: "Please provide a file in the request body" }
            };
            return;
        }

        // Log the request body for debugging
        context.log('Request body:', req.body);
        context.log('Content-Type:', req.headers['content-type']);

        // Handle the raw body data
        let rawBody = req.body;
        if (typeof req.body === 'string') {
            rawBody = Buffer.from(req.body);
        } else if (req.body instanceof Uint8Array) {
            rawBody = Buffer.from(req.body);
        }

        // Parse the multipart form data
        const boundary = multipart.getBoundary(req.headers['content-type']);
        context.log('Boundary:', boundary);

        if (!boundary) {
            context.log('No boundary found in content-type');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: { error: "Invalid content-type header" }
            };
            return;
        }

        const parts = multipart.parse(rawBody, boundary);
        context.log('Parsed parts:', JSON.stringify(parts, null, 2));

        // Look for the file part with name 'newfile'
        const filePart = parts.find(part => {
            context.log('Checking part:', JSON.stringify(part));
            return part.name === 'newfile';
        });

        if (!filePart || !filePart.data) {
            context.log('No file part found in request');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: { error: "No file found in the request" }
            };
            return;
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileName = `${Date.now()}-${filePart.filename || 'unnamed-file'}`;
        const filePath = path.join(uploadsDir, fileName);

        // Write the file
        await fs.writeFile(filePath, filePart.data);
        
        context.log(`File successfully uploaded: ${fileName}`);
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                message: "File uploaded successfully",
                fileName: fileName,
                path: `/uploads/${fileName}`
            }
        };
    } catch (error) {
        context.log.error('Error uploading file:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                error: `Error uploading file: ${error.message}`
            }
        };
    }
};
