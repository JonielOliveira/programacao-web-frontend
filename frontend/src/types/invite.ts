export interface InviteUser {
  id: string;
  username: string;
  fullName: string;
}

export interface SentInvite {
  id: string;
  createdAt: string;
  receiver: InviteUser;
}

export interface ReceivedInvite {
  id: string;
  createdAt: string;
  sender: InviteUser;
}
