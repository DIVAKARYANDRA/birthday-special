const TOKEN_KEY = "pooja_kitchen_token";


export function setAuthToken(
  token: string | null
): void {

  if(token){

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

  }
  else{

    localStorage.removeItem(
      TOKEN_KEY
    );

  }

}


export function getAuthToken(): string | null {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


export function clearAuthToken(): void {

  localStorage.removeItem(
    TOKEN_KEY
  );

}