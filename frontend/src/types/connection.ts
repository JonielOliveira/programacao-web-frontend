export interface ConnectionUser {
  id: string;
  username: string;
  fullName: string;
}

export interface Connection {
  id: string;
  createdAt: string;
  user: ConnectionUser;
}
