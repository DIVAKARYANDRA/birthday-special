const TOKEN_KEY = "pooja_kitchen_token";

export function setAuthToken(
  token: string | null
): void {

  console.log("[PoojaKitchen Auth] Setting token:", !!token);

  if (token) {
    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  } else {
    localStorage.removeItem(
      TOKEN_KEY
    );
  }
}

export function getAuthToken(): string | null {

  const token =
    localStorage.getItem(TOKEN_KEY);

  console.log(
    "[PoojaKitchen Auth] Reading token:",
    !!token
  );

  return token;
}

export function clearAuthToken(): void {

  localStorage.removeItem(TOKEN_KEY);

}