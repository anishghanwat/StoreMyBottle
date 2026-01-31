# Backend Setup Instructions

## Prerequisites

Before running npm install, ensure npm is configured to access the registry:
- Check if `npm config get offline` returns `false`
- If it returns `true`, run: `npm config set offline false` (may require admin permissions)
- Or set environment variable: `$env:npm_config_offline='false'` (PowerShell)

## Installation Steps

1. Install production dependencies:
```bash
npm install express dotenv pg uuid qrcode @clerk/express
```

2. Install development dependencies:
```bash
npm install -D typescript @types/node @types/express @types/pg ts-node nodemon
```

3. Verify installation:
```bash
npm run type-check
npm run dev
```

## Dependencies Required

### Production:
- express
- dotenv
- pg (PostgreSQL client)
- uuid (for generating unique tokens)
- qrcode (for QR code generation)
- @clerk/express (for Clerk authentication)

### Development:
- typescript
- @types/node
- @types/express
- @types/pg
- @types/uuid
- @types/qrcode
- ts-node
- nodemon
