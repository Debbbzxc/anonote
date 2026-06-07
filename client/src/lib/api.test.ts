import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

async function importApi() {
  return import("./api");
}

describe("request function", () => {
  it("injects Bearer token from localStorage", async () => {
    localStorage.setItem("anonote-token", "test-jwt-token");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "ok" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { request } = await importApi();
    const result = await request("/test");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
        }),
      })
    );
    expect(result).toEqual({ data: "ok" });
  });

  it("does not send Authorization header when no token", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { request } = await importApi();
    await request("/test");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws on non-ok response with server error message", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { request } = await importApi();
    await expect(request("/auth/login")).rejects.toThrow("Invalid credentials");
  });

  it("handles 204 No Content", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => { throw new Error("no body"); },
    });
    vi.stubGlobal("fetch", mockFetch);

    const { request } = await importApi();
    const result = await request("/auth/logout", { method: "POST" });
    expect(result).toBeUndefined();
  });

  it("uses VITE_API_URL when set", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_URL", "https://my-api.com/api");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const mod = await import("./api");
    await mod.request("/notes");

    expect(mockFetch.mock.calls[0][0]).toBe("https://my-api.com/api/notes");

    vi.unstubAllEnvs();
  });
});

describe("API module shape", () => {
  it("exports auth and notes namespaces with expected methods", async () => {
    const { api } = await importApi();
    expect(api.auth).toBeDefined();
    expect(typeof api.auth.login).toBe("function");
    expect(typeof api.auth.register).toBe("function");
    expect(typeof api.auth.logout).toBe("function");

    expect(api.notes).toBeDefined();
    expect(typeof api.notes.list).toBe("function");
    expect(typeof api.notes.create).toBe("function");
    expect(typeof api.notes.update).toBe("function");
    expect(typeof api.notes.delete).toBe("function");
  });
});
