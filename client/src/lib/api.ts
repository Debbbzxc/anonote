const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("anonote-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

type AuthResponse = { token: string; userId: string; username: string; salt: string };

export const api = {
  auth: {
    register: (data: { username: string; password: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
  },
  notes: {
    list: () => request<NoteDTO[]>("/notes"),
    create: (data: EncryptedNoteData) =>
      request<NoteDTO>("/notes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: EncryptedNoteData) =>
      request<NoteDTO>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/notes/${id}`, { method: "DELETE" }),
  },
};

export interface NoteDTO {
  _id: string;
  userId: string;
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
  ivContent: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedNoteData {
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
  ivContent: string;
  salt: string;
}
