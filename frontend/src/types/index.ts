export interface Account {
  id: string
  email: string
  name: string
  avatar_url: string
}

export interface OAuthParams {
  client_id: string
  redirect_uri: string
  response_type: string
  state: string
  scope: string
}
