// Centralized logging utility for customs automation

// Better Stack HTTP API endpoint
const BETTERSTACK_ENDPOINT = 'https://in.logs.betterstack.com';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export enum ErrorCode {
  BROWSER_LAUNCH_ERROR = 'BROWSER_LAUNCH_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NAVIGATION_FAILED = 'NAVIGATION_FAILED',
  QR_EXTRACTION_FAILED = 'QR_EXTRACTION_FAILED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  FORM_FILL_ERROR = 'FORM_FILL_ERROR',
  API_ERROR = 'API_ERROR'
}

interface LogContext {
  passport?: string;
  sessionId?: string;
  step?: string;
  duration?: number;
  [key: string]: unknown;
}

interface SystemInfo {
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  platform?: string;
  nodeVersion?: string;
}

class Logger {
  private sessionId: string = '';
  private startTime: number = Date.now();

  setSessionId(id: string) {
    this.sessionId = id;
  }

  private getSystemInfo(): SystemInfo {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const used = process.memoryUsage();
      return {
        memory: {
          used: Math.round(used.heapUsed / 1024 / 1024),
          total: Math.round(used.heapTotal / 1024 / 1024),
          percentage: Math.round((used.heapUsed / used.heapTotal) * 100)
        },
        platform: process.platform,
        nodeVersion: process.version
      };
    }
    return {};
  }

  private formatLog(
    level: LogLevel,
    code: ErrorCode | string,
    message: string,
    context?: LogContext,
    error?: Error
  ): { formatted: string; structured: Record<string, unknown> } {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - this.startTime;
    const system = this.getSystemInfo();

    const structured = {
      timestamp,
      level,
      code,
      message,
      sessionId: this.sessionId,
      duration: `${duration}ms`,
      context: context || {},
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }),
      system
    };

    // Format for console output
    const prefix = `[${timestamp}] [${level}] [${code}]`;
    const contextStr = context ? `\n  Context: ${JSON.stringify(context, null, 2)}` : '';
    const errorStr = error ? `\n  Error: ${error.message}\n  Stack: ${error.stack}` : '';
    const systemStr = system.memory ? `\n  Memory: ${system.memory.used}MB/${system.memory.total}MB (${system.memory.percentage}%)` : '';

    const formatted = `${prefix} ${message}${contextStr}${errorStr}${systemStr}`;

    return { formatted, structured };
  }

  private async sendToBetterStack(level: LogLevel, structured: Record<string, unknown>) {
    // Only send if API token is configured
    if (!process.env.BETTERSTACK_API_TOKEN) {
      return;
    }

    try {
      // Send log to Better Stack via HTTP API
      const response = await fetch(BETTERSTACK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BETTERSTACK_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dt: structured.timestamp || new Date().toISOString(),
          level: level.toLowerCase(),
          message: structured.message as string,
          code: structured.code,
          sessionId: structured.sessionId,
          duration: structured.duration,
          context: structured.context,
          error: structured.error,
          system: structured.system,
        }),
      });

      // Log if request failed (but don't throw to avoid breaking the app)
      if (!response.ok) {
        console.error(`Better Stack API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Silent fail - don't break the application if logging fails
      // Only log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send log to Better Stack:', error);
      }
    }
  }

  error(code: ErrorCode, message: string, context?: LogContext, error?: Error) {
    const { formatted, structured } = this.formatLog(LogLevel.ERROR, code, message, context, error);
    console.error(formatted);
    
    // Send to Better Stack (async, non-blocking)
    this.sendToBetterStack(LogLevel.ERROR, structured);
  }

  warn(code: string, message: string, context?: LogContext) {
    const { formatted, structured } = this.formatLog(LogLevel.WARN, code, message, context);
    console.warn(formatted);
    
    // Send to Better Stack (async, non-blocking)
    this.sendToBetterStack(LogLevel.WARN, structured);
  }

  info(code: string, message: string, context?: LogContext) {
    const { formatted, structured } = this.formatLog(LogLevel.INFO, code, message, context);
    console.log(formatted);
    
    // Send to Better Stack (async, non-blocking)
    this.sendToBetterStack(LogLevel.INFO, structured);
  }

  debug(code: string, message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      const { formatted, structured } = this.formatLog(LogLevel.DEBUG, code, message, context);
      console.log(formatted);
      
      // Send to Better Stack (async, non-blocking)
      this.sendToBetterStack(LogLevel.DEBUG, structured);
    }
  }

  // Specific logging methods for common scenarios
  logBrowserLaunch(success: boolean, options?: Record<string, unknown>, error?: Error) {
    if (success) {
      this.info('BROWSER_LAUNCH', 'Browser launched successfully', { options });
    } else {
      this.error(
        ErrorCode.BROWSER_LAUNCH_ERROR,
        'Failed to launch browser',
        { options },
        error
      );
    }
  }

  logNavigation(url: string, success: boolean, responseStatus?: number, error?: Error) {
    if (success) {
      this.info('NAVIGATION', `Navigated to ${url}`, { url, responseStatus });
    } else {
      this.error(
        ErrorCode.NETWORK_TIMEOUT,
        `Failed to navigate to ${url}`,
        { url, responseStatus },
        error
      );
    }
  }

  logElementInteraction(
    action: string,
    selector: string,
    success: boolean,
    error?: Error
  ) {
    if (success) {
      this.debug('ELEMENT_INTERACTION', `${action} on ${selector}`, { action, selector });
    } else {
      this.error(
        ErrorCode.ELEMENT_NOT_FOUND,
        `Failed to ${action} on ${selector}`,
        { action, selector },
        error
      );
    }
  }

  logFormValidation(fields: Array<{field: string, issue?: string}>, allValid: boolean) {
    if (allValid) {
      this.info('FORM_VALIDATION', 'All form fields valid', { fieldCount: fields.length });
    } else {
      const invalidFields = fields.filter(f => f.issue);
      this.warn('FORM_VALIDATION', `${invalidFields.length} invalid fields`, {
        invalidFields: invalidFields.map(f => ({ field: f.field, issue: f.issue }))
      });
    }
  }

  logApiRequest(method: string, endpoint: string, passport?: string) {
    this.info('API_REQUEST', `${method} ${endpoint}`, { 
      method, 
      endpoint, 
      passport,
      timestamp: new Date().toISOString() 
    });
  }

  logApiResponse(success: boolean, duration: number, error?: unknown) {
    if (success) {
      this.info('API_RESPONSE', 'Request completed successfully', { duration });
    } else {
      this.error(
        ErrorCode.API_ERROR,
        'Request failed',
        { duration },
        error instanceof Error ? error : undefined
      );
    }
  }

  // Performance logging
  startTimer(label: string): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug('PERFORMANCE', `${label} took ${duration}ms`, { label, duration });
      return duration;
    };
  }
}

// Export singleton instance
export const logger = new Logger();