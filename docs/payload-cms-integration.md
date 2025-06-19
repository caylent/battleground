# Payload CMS Integration for Dynamic Models

This document explains how to use the new Payload CMS integration to manage text models dynamically instead of using static model definitions.

## Overview

The battleground application now supports dynamic model management through Payload CMS. This allows you to:

- Add, edit, and remove text models through a web interface
- Manage model configurations (temperature, max tokens, etc.) dynamically
- Enable/disable models without code changes
- Maintain consistent model data across environments

## Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Payload CMS Configuration
PAYLOAD_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/battleground
```

### 2. Database Setup

Make sure you have MongoDB running locally or provide a connection string to a remote MongoDB instance.

### 3. Initial Migration

To populate Payload CMS with your existing static models, run:

```bash
npm run migrate-models
```

This will create entries in the CMS for all your current static models.

## Usage

### Accessing the CMS Admin

Start your application and navigate to `/admin` to access the Payload CMS admin interface.

### Managing Models

1. **View Models**: Go to the "Text Models" collection in the admin interface
2. **Add Model**: Click "Create New" to add a new text model
3. **Edit Model**: Click on any existing model to edit its properties
4. **Enable/Disable**: Use the "Is Active" checkbox to enable/disable models

### Model Fields

- **Name**: Display name for the model
- **Provider**: The provider (Amazon, OpenAI, etc.)
- **Model ID**: The actual model identifier used in API calls
- **Region**: Optional AWS region specification
- **Input/Output Cost**: Cost per token for input and output
- **Modalities**: Supported input/output modalities (TEXT, IMAGE, etc.)
- **System Prompt Support**: Whether the model supports system prompts
- **Configuration**: Model-specific configuration (temperature, max tokens, etc.)

## How It Works

### Dynamic Loading

The application uses a caching system to load models:

1. **First Load**: Fetches models from Payload CMS
2. **Caching**: Caches models for 5 minutes to reduce API calls  
3. **Fallback**: Falls back to static models if CMS is unavailable

### API Integration

The models are loaded asynchronously using the `getTextModels()` function:

```typescript
import { getTextModels } from '@/lib/model/models'

// Async usage
const models = await getTextModels()

// Sync usage (uses cache or static fallback)
import { textModels } from '@/lib/model/models'
```

### Chat Store Integration

The chat store automatically uses the dynamic models, but maintains backward compatibility with the existing static model system.

## Migration from Static Models

The integration maintains full backward compatibility:

- Existing code continues to work without changes
- Static models are used as fallback when CMS is unavailable
- The `migrate-models` script helps transition existing models to the CMS

## API Endpoints

Once set up, Payload CMS provides REST API endpoints:

- `GET /api/text-models` - Get all text models
- `POST /api/text-models` - Create a new text model
- `GET /api/text-models/:id` - Get a specific text model
- `PATCH /api/text-models/:id` - Update a text model
- `DELETE /api/text-models/:id` - Delete a text model

## Troubleshooting

### Models Not Loading

1. Check that MongoDB is running and accessible
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Run the migration script to ensure models exist in the CMS

### Admin Interface Not Accessible

1. Ensure the application is running
2. Navigate to `/admin` (not `/admin/`)
3. Check that Payload CMS is properly configured

### Cache Issues

To refresh the model cache:

```typescript
import { refreshModelsCache } from '@/lib/model/models'
refreshModelsCache()
```

## Development

### Adding New Fields

To add new fields to the TextModels collection:

1. Edit `src/payload/collections/TextModels.ts`
2. Update the `PayloadTextModel` interface in `src/lib/services/payload-models.ts`
3. Update the mapping in `getTextModelsFromPayload()` function

### Extending to Other Model Types

The system can be extended to support image and video models by:

1. Creating new collections (ImageModels, VideoModels)
2. Adding corresponding service functions
3. Updating the models.ts exports