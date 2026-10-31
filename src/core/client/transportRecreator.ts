import { SSEClientTransport, SSEClientTransportOptions } from '@modelcontextprotocol/sdk/client/sse.js';
import {
  StreamableHTTPClientTransport,
  StreamableHTTPClientTransportOptions,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { AuthProviderTransport } from '@src/core/types/index.js';

/**
 * The SDK keeps the options a transport was built with in private fields and
 * exposes no getter. The session id is deliberately not read: a recreated
 * transport must start a new session.
 */
interface TransportOptionsFields {
  _url: URL;
  _requestInit?: RequestInit;
  _eventSourceInit?: SSEClientTransportOptions['eventSourceInit'];
  _fetch?: StreamableHTTPClientTransportOptions['fetch'];
  _reconnectionOptions?: StreamableHTTPClientTransportOptions['reconnectionOptions'];
}

export class TransportRecreator {
  public recreateHttpTransport(transport: AuthProviderTransport, serverName?: string): AuthProviderTransport {
    if (!(transport instanceof StreamableHTTPClientTransport) && !(transport instanceof SSEClientTransport)) {
      const name = serverName ? `Transport for ${serverName}` : 'Transport';
      throw new Error(`${name} does not support OAuth (requires HTTP or SSE transport)`);
    }

    const fields = transport as unknown as TransportOptionsFields;
    const transportUrl = fields._url;
    const authTransport = transport as AuthProviderTransport;
    const oauthProvider = authTransport.oauthProvider;

    // requestInit carries the configured headers (Bearer tokens, User-Agent). Rebuilding from the URL
    // and the OAuth provider alone sent every reconnect or retry of a header-authenticated server
    // without its token.
    const newTransport: AuthProviderTransport =
      transport instanceof StreamableHTTPClientTransport
        ? (new StreamableHTTPClientTransport(transportUrl, {
            authProvider: oauthProvider,
            requestInit: fields._requestInit,
            fetch: fields._fetch,
            reconnectionOptions: fields._reconnectionOptions,
          }) as AuthProviderTransport)
        : (new SSEClientTransport(transportUrl, {
            authProvider: oauthProvider,
            requestInit: fields._requestInit,
            eventSourceInit: fields._eventSourceInit,
            fetch: fields._fetch,
          }) as AuthProviderTransport);

    newTransport.oauthProvider = oauthProvider;
    newTransport.connectionTimeout = authTransport.connectionTimeout;
    newTransport.requestTimeout = authTransport.requestTimeout;
    newTransport.timeout = authTransport.timeout;
    newTransport.tags = authTransport.tags;

    return newTransport;
  }
}
