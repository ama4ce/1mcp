import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

import { SDKOAuthClientProvider } from '@src/auth/sdkOAuthClientProvider.js';

import { EnhancedTransport, MCPServerParams } from './transport.js';

/**
 * Enum representing possible client connection states
 */
export enum ClientStatus {
  /** Client is successfully connected */
  Connected = 'connected',
  /** Client is disconnected */
  Disconnected = 'disconnected',
  /** Client encountered an error */
  Error = 'error',
  /** Client is waiting for OAuth authorization */
  AwaitingOAuth = 'awaiting_oauth',
}

/**
 * Transport that includes an OAuth provider
 */
export interface AuthProviderTransport extends EnhancedTransport {
  oauthProvider?: SDKOAuthClientProvider;
}

/**
 * Complete outbound connection information including transport, status and history
 */
export interface OutboundConnection {
  readonly name: string;
  // Mutable: swapped when the Restart-OAuth flow rebuilds the underlying
  // transport (the SDK's StreamableHTTP/SSE close() leaves _abortController
  // in a non-resettable state, so start() throws on reuse).
  transport: AuthProviderTransport;
  client: Client;
  lastError?: Error;
  lastConnected?: Date;
  status: ClientStatus;
  capabilities?: ServerCapabilities;
  /** Instructions provided by the server during initialization */
  instructions?: string;
  /** OAuth authorization URL for user to complete authentication */
  authorizationUrl?: string;
  /** When OAuth authorization was initiated */
  oauthStartTime?: Date;
  /** Server configuration including disabledTools, enabledTools, etc. */
  serverConfig?: MCPServerParams;
}

/**
 * Map of outbound connections indexed by connection name
 */
export type OutboundConnections = Map<string, OutboundConnection>;

/**
 * Options for client operations
 */
export interface OperationOptions {
  readonly retryCount?: number;
  readonly retryDelay?: number;
}
