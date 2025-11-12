# Deployment Guide for Indonesian Customs Automation

## Chrome/Chromium Setup for Different Platforms

This application uses Puppeteer for browser automation, which requires Chrome or Chromium to be installed in your deployment environment.

### Local Development

```bash
# Install Chrome via Puppeteer
npx puppeteer browsers install chrome

# Or use system Chrome/Chromium
# The app will automatically detect it
```

### Vercel Deployment

1. Install the Vercel-compatible Chromium package:
```bash
npm install @sparticuz/chromium
```

2. Set environment variable in Vercel dashboard:
```
CHROME_PATH=/opt/chromium
```

3. Update `vercel.json` (if needed):
```json
{
  "functions": {
    "app/api/submit-customs/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### AWS Lambda Deployment

1. Install AWS Lambda Chrome package:
```bash
npm install chrome-aws-lambda puppeteer-core
```

2. The app will automatically detect and use it.

3. Ensure Lambda function has sufficient memory (at least 512MB recommended).

### Docker Deployment

Add to your Dockerfile:
```dockerfile
# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path
ENV CHROME_PATH=/usr/bin/chromium
```

### Railway/Render/Fly.io

These platforms typically have buildpacks that can install Chrome. Add a `nixpacks.toml` or similar config:

```toml
[phases.setup]
aptPkgs = ["chromium"]

[phases.build]
cmds = ["npm install", "npm run build"]
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CHROME_PATH` | Path to Chrome executable | `/usr/bin/chromium` |
| `NODE_ENV` | Environment mode | `production` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | Skip auto-download | `true` (for custom installs) |
| `BETTERSTACK_API_TOKEN` | Better Stack Telemetry API token (optional) | `your_token_here` |
| `SQUARE_ACCESS_TOKEN` | Square payment access token | `your_token_here` |
| `SQUARE_LOCATION_ID` | Square location ID | `LSSYB466FR338` |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Square app ID (client-side) | `your_app_id` |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Square location ID (client-side) | `LSSYB466FR338` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Auto-injected by Vercel |

## Logging Setup (Better Stack)

The application uses Better Stack's HTTP API for persistent log storage, overcoming Vercel's 256-line, 1-day log retention limits.

### Setup Steps:

1. **Create Better Stack Account**
   - Go to https://betterstack.com/
   - Sign up for free account (1GB/month, 3-day retention)

2. **Get Telemetry API Token**
   - Follow the guide: https://betterstack.com/docs/logs/api/getting-started/
   - Navigate to your team's API tokens page
   - Create a new **"Telemetry API token"** (not a source token)
   - Copy the token (it's a long alphanumeric string)

3. **Add to Local Development**
   ```bash
   # Add to .env.local
   BETTERSTACK_API_TOKEN=your_telemetry_api_token_here
   ```

4. **Add to Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `BETTERSTACK_API_TOKEN` with your token
   - Select environments: Production, Preview, Development
   - Click Save

5. **Redeploy**
   - Trigger a new deployment for changes to take effect
   - Or run: `vercel --prod`

### Features:

- ✅ **Persistent Logs**: 3-day retention (free tier), upgradeable
- ✅ **Real-time Streaming**: See logs as they happen
- ✅ **Search & Filter**: Find specific logs quickly
- ✅ **Structured Data**: All context, errors, and metadata preserved
- ✅ **No Code Changes**: Uses existing logger automatically

### Viewing Logs:

1. Go to https://logs.betterstack.com/
2. Select your source
3. View real-time logs with full context
4. Use search to filter by:
   - Session ID
   - Error codes
   - Passport numbers
   - Time ranges
   - Log levels

### Log Levels:

- **ERROR**: Critical failures, exceptions
- **WARN**: Validation issues, retries
- **INFO**: Successful operations, milestones
- **DEBUG**: Detailed step-by-step (dev only)

### Troubleshooting:

**Logs not appearing in Better Stack?**
1. Verify `BETTERSTACK_API_TOKEN` is set in Vercel
2. Make sure you're using a **Telemetry API token** (not Source token)
3. Check token is correct (no extra spaces)
4. Redeploy after adding environment variable
5. Check Better Stack dashboard for logs

**Want longer retention?**
- Upgrade to paid plan ($5/month for 30-day retention)
- Or export logs periodically to your own storage

### Troubleshooting

#### Error: "Could not find Chrome"

**Solution 1:** Install platform-specific Chrome package
- Vercel: `@sparticuz/chromium`
- AWS Lambda: `chrome-aws-lambda`
- Docker: System chromium

**Solution 2:** Set `CHROME_PATH` environment variable

**Solution 3:** Increase function timeout (Chrome launch can take time)

#### Error: "Browser launch timeout"

- Increase function timeout to at least 30 seconds
- Ensure sufficient memory (512MB minimum)
- Check logs for specific Chrome launch errors

#### Error: "Page crash" or "Target closed"

- Increase memory allocation
- Add `--disable-dev-shm-usage` flag (already included)
- Check for resource limits in your platform

### Testing Deployment

1. Deploy your application
2. Check logs for browser launch confirmation
3. Test with a simple request first
4. Monitor memory and timeout metrics

### Performance Optimization

The application includes automatic optimizations for serverless:
- Single process mode
- Disabled GPU acceleration
- Optimized Chrome flags
- Smart timeouts and retries

### Support

For platform-specific issues:
- Vercel: https://github.com/Sparticuz/chromium
- AWS Lambda: https://github.com/alixaxel/chrome-aws-lambda
- Puppeteer: https://pptr.dev/troubleshooting