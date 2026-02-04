import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ` +
      `${statusColor}${res.statusCode}\x1b[0m - ${duration}ms`
    );
  });
  
  next();
}

function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green
  if (statusCode >= 300 && statusCode < 400) return '\x1b[33m'; // Yellow
  if (statusCode >= 400 && statusCode < 500) return '\x1b[31m'; // Red
  if (statusCode >= 500) return '\x1b[35m'; // Magenta
  return '\x1b[0m'; // Default
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  res.status(500).json({
    data: null,
    status: 500,
    statusText: 'Internal Server Error',
    success: false,
    timestamp: new Date().toISOString(),
  });
}
