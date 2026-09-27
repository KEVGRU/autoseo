import * as oidc from "openid-client";
import { STATE_TTL_SECONDS, stateMatches, type OidcFlowState } from "./state";

/**
 * Authorization Code flow with PKCE (S256) + state + nonce on top of openid-client (no server-only imports so it
 * can be tested against a mocked IdP in oidc.test.ts).
 */

export class OidcFlowError extends Error {
  constructor(
    public reason:
      | "state_missing"
      | "state_mismatch"
      | "idp_error"
      | "token_exchange_failed"
      | "no_id_token"
      | "provider_unavailable"
      | "provider_changed"
      | "missing_subject"
      | "missing_email"
      | "email_not_verified"
      | "domain_not_allowed"
      | "identity_conflict"
      | "not_invited"
      | "account_disabled"
      | "admin_not_allowed"
      | "account_switch"
      | "workspace_paused"
      | "rate_limited",
    message?: string,
  ) {
    super(message ?? reason);
  }
}

export async function buildAuthorizationRequest(
  config: oidc.Configuration,
  opts: { providerKey: string; clientId: string; redirectUri: string; scopes: string; loginHint?: string | null; next: string | null; nowSeconds?: number },
): Promise<{ url: URL; flow: OidcFlowState }> {
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const params: Record<string, string> = {
    redirect_uri: opts.redirectUri,
    scope: opts.scopes,
    response_type: "code",
    code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
    state,
    nonce,
  };
  if (opts.loginHint) params.login_hint = opts.loginHint;
  return {
    url: oidc.buildAuthorizationUrl(config, params),
    flow: {
      providerKey: opts.providerKey,
      issuer: config.serverMetadata().issuer,
      clientId: opts.clientId,
      state,
      nonce,
      codeVerifier,
      next: opts.next,
      exp: (opts.nowSeconds ?? Math.floor(Date.now() / 1000)) + STATE_TTL_SECONDS,
    },
  };
}

/**
 * Validates the authorization response and redeems the code. `callbackUrl` must be the public redirect URI plus
 * the query the IdP sent (openid-client derives redirect_uri from it). Returns the verified ID token claims.
 */
export async function exchangeAuthorizationCode(config: oidc.Configuration, callbackUrl: URL, flow: OidcFlowState): Promise<Record<string, unknown>> {
  if (callbackUrl.searchParams.get("error")) {
    throw new OidcFlowError("idp_error", (callbackUrl.searchParams.get("error_description") ?? callbackUrl.searchParams.get("error") ?? "").slice(0, 300));
  }
  if (!stateMatches(flow.state, callbackUrl.searchParams.get("state"))) throw new OidcFlowError("state_mismatch");
  let tokens: Awaited<ReturnType<typeof oidc.authorizationCodeGrant>>;
  try {
    tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: flow.codeVerifier,
      expectedState: flow.state,
      expectedNonce: flow.nonce,
      idTokenExpected: true,
    });
  } catch (err) {
    throw new OidcFlowError("token_exchange_failed", err instanceof Error ? err.message.slice(0, 300) : "Token exchange failed");
  }
  const claims = tokens.claims();
  if (!claims) throw new OidcFlowError("no_id_token");
  return claims as unknown as Record<string, unknown>;
}
