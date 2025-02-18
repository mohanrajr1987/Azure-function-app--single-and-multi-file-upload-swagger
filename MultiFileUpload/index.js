const multipart = require('multipart-formdata');
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Uploads multiple files to the local uploads directory. Use the 'newfiles' parameter for each file.
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               newfiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Use this parameter name for each file you want to upload
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
 *                   example: "Files uploaded successfully"
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       originalName:
 *                         type: string
 *                         example: "example.jpg"
 *                       uploadedName:
 *                         type: string
 *                         example: "1739873017591-example.jpg"
 *                       path:
 *                         type: string
 *                         example: "/uploads/1739873017591-example.jpg"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No files found in the request"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error uploading files: Internal server error"
 */
module.exports = async function (context, req) {
    context.log('Processing multiple files upload request');
    context.log('Headers:', JSON.stringify(req.headers));
    
    try {
        if (!req.body || !req.headers['content-type']) {
            context.log('No request body or content-type header');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: { error: "Please provide files in the request body" }
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

        // Look for all parts with name 'newfiles'
        const fileParts = parts.filter(part => {
            context.log('Checking part:', JSON.stringify(part));
            return part.name === 'newfiles' && part.data;
        });

        if (fileParts.length === 0) {
            context.log('No files found in request');
            context.res = {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: { error: "No files found in the request" }
            };
            return;
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Upload all files
        const uploadResults = await Promise.all(fileParts.map(async (filePart) => {
            const fileName = `${Date.now()}-${filePart.filename || 'unnamed-file'}`;
            const filePath = path.join(uploadsDir, fileName);
            
            await fs.writeFile(filePath, filePart.data);
            context.log(`File uploaded: ${fileName}`);
            
            return {
                originalName: filePart.filename || 'unnamed-file',
                uploadedName: fileName,
                path: `/uploads/${fileName}`
            };
        }));

        context.log(`Successfully uploaded ${uploadResults.length} files`);
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                message: "Files uploaded successfully",
                files: uploadResults
            }
        };
    } catch (error) {
        context.log.error('Error uploading files:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                error: `Error uploading files: ${error.message}`
            }
        };
    }
};
