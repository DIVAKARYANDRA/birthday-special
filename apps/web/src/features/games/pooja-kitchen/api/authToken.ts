const ACCESS_TOKEN_KEY = "pooja_kitchen_token";
const REFRESH_TOKEN_KEY = "pooja_kitchen_refresh_token";

export function setAuthTokens(
  accessToken: string | null,
  refreshToken: string | null
): void {
  console.log(
    "[PoojaKitchen Auth] Setting tokens:",
    {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    }
  );

  if (accessToken) {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );
  } else {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );
  }

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  } else {
    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );
  }
}

export function setAuthToken(
  token: string | null
): void {
  setAuthTokens(
    token,
    getRefreshToken()
  );
}

export function getAuthToken(): string | null {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function clearAuthToken(): void {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
}

export function clearAuthTokens(): void {
  clearAuthToken();
}