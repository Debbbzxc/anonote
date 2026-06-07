import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    auth: {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.resetAllMocks();
  vi.resetModules();
});

describe("auth-store", () => {
  it("initializes with token from localStorage and password from sessionStorage", async () => {
    localStorage.setItem("anonote-token", "saved-token");
    sessionStorage.setItem("anonote-password", "saved-pass");

    const { useAuthStore } = await import("./auth-store");
    const state = useAuthStore.getState();

    expect(state.token).toBe("saved-token");
    expect(state.password).toBe("saved-pass");
    expect(state.isAuthenticated).toBe(true);
  });

  it("initializes as unauthenticated when no token in localStorage", async () => {
    const { useAuthStore } = await import("./auth-store");
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("login saves token to localStorage and password to sessionStorage on success", async () => {
    const { useAuthStore } = await import("./auth-store");
    const mockApi = await import("@/lib/api");
    vi.mocked(mockApi.api.auth.login).mockResolvedValue({
      token: "jwt-token",
      userId: "user-1",
      username: "testuser",
      salt: "abcdef",
    });

    await useAuthStore.getState().login("testuser", "testpass");

    expect(localStorage.getItem("anonote-token")).toBe("jwt-token");
    expect(localStorage.getItem("anonote-userId")).toBe("user-1");
    expect(sessionStorage.getItem("anonote-password")).toBe("testpass");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("login rethrows error and sets error state on failure", async () => {
    const { useAuthStore } = await import("./auth-store");
    const mockApi = await import("@/lib/api");
    vi.mocked(mockApi.api.auth.login).mockRejectedValue(new Error("Invalid credentials"));

    await expect(useAuthStore.getState().login("bad", "creds")).rejects.toThrow("Invalid credentials");
    expect(useAuthStore.getState().error).toBe("Invalid credentials");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("register rethrows error and sets error state on failure", async () => {
    const { useAuthStore } = await import("./auth-store");
    const mockApi = await import("@/lib/api");
    vi.mocked(mockApi.api.auth.register).mockRejectedValue(new Error("Username taken"));

    await expect(useAuthStore.getState().register("taken", "password123")).rejects.toThrow("Username taken");
    expect(useAuthStore.getState().error).toBe("Username taken");
  });

  it("register saves password to sessionStorage on success", async () => {
    const { useAuthStore } = await import("./auth-store");
    const mockApi = await import("@/lib/api");
    vi.mocked(mockApi.api.auth.register).mockResolvedValue({
      token: "jwt-token",
      userId: "user-1",
      username: "newuser",
      salt: "xyz789",
    });

    await useAuthStore.getState().register("newuser", "mypassword");

    expect(sessionStorage.getItem("anonote-password")).toBe("mypassword");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("logout clears localStorage, sessionStorage, and resets state", async () => {
    localStorage.setItem("anonote-token", "tok");
    localStorage.setItem("anonote-userId", "uid");
    localStorage.setItem("anonote-username", "u");
    localStorage.setItem("anonote-salt", "s");
    sessionStorage.setItem("anonote-password", "p");

    const { useAuthStore } = await import("./auth-store");
    await useAuthStore.getState().logout();

    expect(localStorage.getItem("anonote-token")).toBeNull();
    expect(sessionStorage.getItem("anonote-password")).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().password).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
