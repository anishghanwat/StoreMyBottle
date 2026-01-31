# StoreMyBottle Backend

## Current Status

⚠️ **IMPORTANT**: npm is currently configured in offline mode. Before proceeding, you need to:

1. Set npm to online mode:
   ```powershell
   $env:npm_config_offline='false'
   ```
   Or configure globally (may require admin):
   ```bash
   npm config set offline false
   ```

2. Install dependencies:
   ```bash
   npm install express dotenv
   npm install -D typescript @types/node @types/express ts-node nodemon
   ```

## Project Structure

- `src/app.ts` - Main Express application
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (template)
- `package.json` - Dependencies and scripts

## Running the Server

Once dependencies are installed:
```bash
npm run dev
```

The server will start on port 3000 (or PORT from .env).

## Testing

After starting the server:
```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "StoreMyBottle API is running",
  "status": "ok"
}
```
