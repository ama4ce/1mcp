import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';

import logger from '@src/logger/logger.js';

import { MCPError, MCPErrorType } from './errorTypes.js';

/**
 * Wraps a function with error handling
 * @param fn The function to wrap
 * @param errorMessage The error message to use if the function fails
 * @returns The wrapped function
 */
export function withErrorHandling<T, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<T>,
  errorMessage: string,
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);

      // Rethrow MCPErrors as is
      if (error instanceof MCPError) {
        throw error;
      }

      // Convert other errors to MCPError
      throw new MCPError(errorMessage, ErrorCode.InternalError, {
        originalError: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };
}

/**
 * Normalizes an error to an MCPError type
 * @param error The error to normalize
 * @param errorMessage The error message to use if the error is not an MCPError
 * @returns The normalized error
 */
export function normalizeError(error: unknown, errorMessage: string): MCPErrorType {
  if (error instanceof MCPError) {
    return error;
  }

  if (error instanceof Error) {
    return new MCPError(error.message || errorMessage, ErrorCode.InternalError);
  }

  return new MCPError(errorMessage, ErrorCode.InternalError);
}

/**
 * Checks if an error is a specific MCPError type
 * @param error The error to check
 * @param errorType The error type to check against
 * @returns True if the error is of the specified type
 */
// Reason: Error constructors have varying signatures; any[] provides flexibility for different error types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMCPError<T extends MCPError>(error: unknown, errorType: new (...args: any[]) => T): error is T {
  return error instanceof errorType;
}

/**
 * Gets the error code from an error
 * @param error The error to get the code from
 * @returns The error code
 */
export function getErrorCode(error: unknown): number {
  if (error instanceof MCPError) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error && Number.isSafeInteger((error as { code: number }).code)) {
    return (error as { code: number }).code;
  }
  return ErrorCode.InternalError;
}

/**
 * Returns true if the error is JSON-RPC "Method not found" (-32601).
 * Used to treat missing resource subscribe/unsubscribe support as a no-op
 * so the client does not treat the session as broken and reload tools.
 * @param error The error to check
 * @returns True if the error indicates the method is not supported
 */
export function isMethodNotFoundError(error: unknown): boolean {
  if (getErrorCode(error) === ErrorCode.MethodNotFound) {
    return true;
  }
  if (error instanceof Error && error.message.includes('Method not found')) {
    return true;
  }
  return false;
}

/**
 * Gets the error message from an error
 * @param error The error to get the message from
 * @returns The error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Gets the error cause from an error
 * @param error The error to get the cause from
 * @returns The error cause
 */
export function getErrorCause(error: unknown): Error | undefined {
  if (error instanceof Error && 'cause' in error) {
    return error.cause as Error;
  }
  return undefined;
}

/**
 * Error response format for JSON-RPC errors
 */
export interface ErrorResponse {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Formats an error for JSON-RPC response
 * @param error The error to format
 * @returns A formatted error object
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof MCPError) {
    return {
      code: error.code,
      message: error.message,
      data: error.data,
    };
  }

  return {
    code: ErrorCode.InternalError,
    message: error instanceof Error ? error.message : String(error),
  };
}
