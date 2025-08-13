import { logMessage, addBreadcrumb } from './sentry';

export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private requestId?: string;

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const reqId = context?.requestId || this.requestId || 'unknown';
    const operation = context?.operation || 'general';
    const userId = context?.userId || 'anonymous';
    
    return `[${timestamp}] [${level.toUpperCase()}] [${reqId}] [${operation}] [${userId}] ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, context?.metadata);
          break;
        case 'info':
          console.info(formattedMessage, context?.metadata);
          break;
        case 'warn':
          console.warn(formattedMessage, context?.metadata);
          break;
        case 'error':
          console.error(formattedMessage, context?.metadata);
          break;
      }
    }

    // Send to Sentry in production (info and above)
    if (!this.isDevelopment && level !== 'debug') {
      const sentryLevel = level === 'warn' ? 'warning' : level;
      logMessage(message, sentryLevel as any, {
        requestId: context?.requestId || this.requestId,
        operation: context?.operation,
        userId: context?.userId,
        ...context?.metadata,
      });
    }

    // Add breadcrumb for context
    addBreadcrumb(message, `log.${level}`, {
      level,
      requestId: context?.requestId || this.requestId,
      operation: context?.operation,
      userId: context?.userId,
      ...context?.metadata,
    });
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // Specialized logging methods for common operations
  
  apiRequest(method: string, endpoint: string, context?: LogContext) {
    this.info(`API ${method} ${endpoint} started`, {
      ...context,
      operation: 'api_request',
      metadata: { method, endpoint, ...context?.metadata },
    });
  }

  apiResponse(method: string, endpoint: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `API ${method} ${endpoint} completed`, {
      ...context,
      operation: 'api_response',
      metadata: { method, endpoint, statusCode, duration, ...context?.metadata },
    });
  }

  aiOperation(operation: string, model: string, duration: number, success: boolean, context?: LogContext) {
    const level = success ? 'info' : 'error';
    this.log(level, `AI ${operation} ${success ? 'completed' : 'failed'}`, {
      ...context,
      operation: 'ai_operation',
      metadata: { 
        aiOperation: operation, 
        model, 
        duration, 
        success, 
        ...context?.metadata 
      },
    });
  }

  userAction(action: string, context?: LogContext) {
    this.info(`User action: ${action}`, {
      ...context,
      operation: 'user_action',
      metadata: { action, ...context?.metadata },
    });
  }

  subscription(action: string, tier: string, context?: LogContext) {
    this.info(`Subscription ${action}: ${tier}`, {
      ...context,
      operation: 'subscription',
      metadata: { subscriptionAction: action, tier, ...context?.metadata },
    });
  }

  database(operation: string, table: string, duration: number, context?: LogContext) {
    this.debug(`Database ${operation} on ${table}`, {
      ...context,
      operation: 'database',
      metadata: { dbOperation: operation, table, duration, ...context?.metadata },
    });
  }

  external(service: string, operation: string, success: boolean, duration: number, context?: LogContext) {
    const level = success ? 'info' : 'warn';
    this.log(level, `External ${service} ${operation} ${success ? 'succeeded' : 'failed'}`, {
      ...context,
      operation: 'external_api',
      metadata: { 
        service, 
        externalOperation: operation, 
        success, 
        duration, 
        ...context?.metadata 
      },
    });
  }

  performance(operation: string, duration: number, metadata?: Record<string, any>, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation: 'performance',
      metadata: { performanceOperation: operation, duration, ...metadata },
    });
  }

  security(event: string, severity: 'low' | 'medium' | 'high', context?: LogContext) {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    this.log(level, `Security event: ${event}`, {
      ...context,
      operation: 'security',
      metadata: { securityEvent: event, severity, ...context?.metadata },
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory function for request-scoped loggers
export function createRequestLogger(requestId: string): Logger {
  const requestLogger = new Logger();
  requestLogger.setRequestId(requestId);
  return requestLogger;
}

// Performance monitoring decorator
export function withPerformanceLogging<T extends (...args: any[]) => any>(
  operation: string,
  fn: T,
  context?: LogContext
): T {
  return ((...args: any[]) => {
    const startTime = Date.now();
    logger.debug(`Starting ${operation}`, context);
    
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((res) => {
            const duration = Date.now() - startTime;
            logger.performance(operation, duration, { success: true }, context);
            return res;
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            logger.performance(operation, duration, { success: false, error: error.message }, context);
            throw error;
          });
      }
      
      // Handle synchronous functions
      const duration = Date.now() - startTime;
      logger.performance(operation, duration, { success: true }, context);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.performance(operation, duration, { success: false, error: error.message }, context);
      throw error;
    }
  }) as T;
}

export default logger;