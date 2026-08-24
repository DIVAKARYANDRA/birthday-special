interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {

  const response = await fetch(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );


  if(!response.ok){
    throw new Error(
      "Invalid username or password"
    );
  }


  return response.json();

}