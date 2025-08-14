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