# Azure Function File Upload

This project contains Azure Functions for handling file uploads with Swagger documentation.

## Features

- Single file upload endpoint
- Multiple file upload endpoint
- Swagger UI documentation
- Automatic file storage
- Unique file naming with timestamps
- Detailed error handling and logging
- JSON responses

## Prerequisites

1. Node.js 18 or later
2. Azure Functions Core Tools
3. Azure Functions extension for VS Code (recommended)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the function app:
   ```bash
   func start
   ```

## API Documentation

Access the Swagger UI documentation at: `http://localhost:7071/api/docs`

### Endpoints

#### 1. Single File Upload
- **URL**: `/api/upload/single`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameter Name**: `newfile`
- **Description**: Uploads a single file to the server

##### Example Response (200 OK):
```json
{
  "message": "File uploaded successfully",
  "fileName": "1739873017591-example.jpg",
  "path": "/uploads/1739873017591-example.jpg"
}
```

#### 2. Multiple File Upload
- **URL**: `/api/upload/multiple`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameter Name**: `newfiles` (use multiple times for multiple files)
- **Description**: Uploads multiple files in a single request

##### Example Response (200 OK):
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "originalName": "example1.jpg",
      "uploadedName": "1739873193987-example1.jpg",
      "path": "/uploads/1739873193987-example1.jpg"
    },
    {
      "originalName": "example2.jpg",
      "uploadedName": "1739873193988-example2.jpg",
      "path": "/uploads/1739873193988-example2.jpg"
    }
  ]
}
```

## Testing with cURL

### Single File Upload
```bash
# Basic usage
curl -X POST -F "newfile=@/path/to/file.jpg" http://localhost:7071/api/upload/single

# With verbose output
curl -v -X POST -F "newfile=@/path/to/file.jpg" http://localhost:7071/api/upload/single
```

### Multiple File Upload
```bash
# Basic usage
curl -X POST \
  -F "newfiles=@/path/to/file1.jpg" \
  -F "newfiles=@/path/to/file2.jpg" \
  http://localhost:7071/api/upload/multiple

# With verbose output
curl -v -X POST \
  -F "newfiles=@/path/to/file1.jpg" \
  -F "newfiles=@/path/to/file2.jpg" \
  http://localhost:7071/api/upload/multiple
```

## Error Handling

The API returns appropriate HTTP status codes and JSON responses:

- **400 Bad Request**: When no file is provided or the request is invalid
- **500 Internal Server Error**: When there's a server-side error

Example error response:
```json
{
  "error": "No file found in the request"
}
```

## File Storage

Uploaded files are stored in the `uploads` directory with the following naming convention:
- Timestamp prefix to ensure uniqueness
- Original filename preserved
- Example: `1739873017591-original.jpg`

