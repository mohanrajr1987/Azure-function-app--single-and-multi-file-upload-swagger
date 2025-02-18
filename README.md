# Azure Function File Upload

This project contains Azure Functions for handling file uploads to Azure Blob Storage.

## Features

- Single file upload endpoint
- Multiple file upload endpoint
- Automatic container creation
- Unique file naming
- Error handling

## Prerequisites

1. Node.js 18 or later
2. Azure Functions Core Tools
3. Azure Storage Account
4. Azure Functions extension for VS Code (recommended)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure local.settings.json:
   - Add your Azure Storage connection string to `AZURE_STORAGE_CONNECTION_STRING`
   - Optionally modify `AZURE_STORAGE_CONTAINER_NAME` (default: "uploads")

## Endpoints

### Single File Upload
- URL: `/api/upload/single`
- Method: POST
- Content-Type: multipart/form-data
- Body: Include file in form data

### Multiple File Upload
- URL: `/api/upload/multiple`
- Method: POST
- Content-Type: multipart/form-data
- Body: Include multiple files in form data

## Running Locally

```bash
npm start
```

## Testing

You can test the endpoints using tools like Postman or curl:

```bash
# Single file upload
curl -X POST http://localhost:7071/api/upload/single -F "file=@/path/to/file"

# Multiple file upload
curl -X POST http://localhost:7071/api/upload/multiple -F "file1=@/path/to/file1" -F "file2=@/path/to/file2"
```
