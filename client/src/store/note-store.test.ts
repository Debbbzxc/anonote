import { describe, it, expect, beforeEach, vi } from "vitest";

const mockEncrypt = vi.fn();
const mockDecrypt = vi.fn();

vi.mock("@/lib/crypto", () => ({
  encrypt: (...args: any[]) => mockEncrypt(...args),
  decrypt: (...args: any[]) => mockDecrypt(...args),
}));

const mockList = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    notes: {
      list: (...args: any[]) => mockList(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
});

describe("note-store", () => {
  it("fetchNotes returns decrypted notes on success", async () => {
    mockList.mockResolvedValue([
      {
        _id: "n1",
        encryptedTitle: "enc-title-1",
        encryptedContent: "enc-content-1",
        iv: "iv1",
        ivContent: "iv2",
        salt: "salt1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      },
    ]);
    mockDecrypt
      .mockResolvedValueOnce("Decrypted Title")
      .mockResolvedValueOnce("Decrypted Content");

    const { useNoteStore } = await import("./note-store");
    await useNoteStore.getState().fetchNotes("password");

    const state = useNoteStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].title).toBe("Decrypted Title");
    expect(state.notes[0].content).toBe("Decrypted Content");
  });

  it("fetchNotes skips notes that fail to decrypt", async () => {
    mockList.mockResolvedValue([
      {
        _id: "good",
        encryptedTitle: "et1",
        encryptedContent: "ec1",
        iv: "iv1",
        ivContent: "iv2",
        salt: "s1",
        createdAt: "",
        updatedAt: "",
      },
      {
        _id: "bad",
        encryptedTitle: "et2",
        encryptedContent: "ec2",
        iv: "iv3",
        ivContent: "iv4",
        salt: "s2",
        createdAt: "",
        updatedAt: "",
      },
    ]);
    mockDecrypt.mockImplementation(async (ciphertext: string) => {
      if (ciphertext === "et1" || ciphertext === "ec1") return "decoded";
      throw new Error("Decrypt failed");
    });

    const { useNoteStore } = await import("./note-store");
    await useNoteStore.getState().fetchNotes("password");

    const state = useNoteStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].id).toBe("good");
  });

  it("createNote encrypts, sends to API, decrypts response, and adds to list", async () => {
    mockEncrypt
      .mockResolvedValueOnce({ ciphertext: "enc-title", iv: "iv-title" })
      .mockResolvedValueOnce({ ciphertext: "enc-content", iv: "iv-content" });

    mockCreate.mockResolvedValue({
      _id: "new-note",
      encryptedTitle: "enc-title",
      encryptedContent: "enc-content",
      iv: "iv-title",
      ivContent: "iv-content",
      salt: "note-salt",
      createdAt: "2024-06-01",
      updatedAt: "2024-06-01",
    });

    mockDecrypt
      .mockResolvedValueOnce("My Title")
      .mockResolvedValueOnce("My Content");

    const { useNoteStore } = await import("./note-store");
    await useNoteStore.getState().createNote("My Title", "My Content", "password", "note-salt");

    expect(mockEncrypt).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenCalledWith({
      encryptedTitle: "enc-title",
      encryptedContent: "enc-content",
      iv: "iv-title",
      ivContent: "iv-content",
      salt: "note-salt",
    });
    expect(mockDecrypt).toHaveBeenCalledWith("enc-title", "password", "note-salt", "iv-title");
    expect(mockDecrypt).toHaveBeenCalledWith("enc-content", "password", "note-salt", "iv-content");

    const state = useNoteStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].title).toBe("My Title");
  });

  it("createNote rethrows error on API failure", async () => {
    mockEncrypt
      .mockResolvedValueOnce({ ciphertext: "et", iv: "iv1" })
      .mockResolvedValueOnce({ ciphertext: "ec", iv: "iv2" });
    mockCreate.mockRejectedValue(new Error("Server error"));

    const { useNoteStore } = await import("./note-store");
    await expect(
      useNoteStore.getState().createNote("T", "C", "pass", "salt")
    ).rejects.toThrow("Server error");
  });

  it("deleteNote rethrows error on API failure", async () => {
    mockDelete.mockRejectedValue(new Error("Not found"));

    const { useNoteStore } = await import("./note-store");
    await expect(
      useNoteStore.getState().deleteNote("bad-id")
    ).rejects.toThrow("Not found");
  });

  it("editNote rethrows error on API failure", async () => {
    mockEncrypt
      .mockResolvedValueOnce({ ciphertext: "et", iv: "iv1" })
      .mockResolvedValueOnce({ ciphertext: "ec", iv: "iv2" });
    mockUpdate.mockRejectedValue(new Error("Update failed"));

    const { useNoteStore } = await import("./note-store");
    await expect(
      useNoteStore.getState().editNote("n1", "T", "C", "pass", "salt")
    ).rejects.toThrow("Update failed");
  });
});
