import { describe, it, expect } from "vitest";
import { encrypt, decrypt, generateSalt } from "./crypto";

describe("generateSalt", () => {
  it("returns a base64 string", async () => {
    const salt = await generateSalt();
    expect(salt).toBeTruthy();
    expect(() => atob(salt)).not.toThrow();
  });

  it("returns different values on each call", async () => {
    const [a, b] = await Promise.all([generateSalt(), generateSalt()]);
    expect(a).not.toBe(b);
  });
});

describe("encrypt / decrypt roundtrip", () => {
  it("encrypts and decrypts a string correctly", async () => {
    const password = "test-password-123";
    const salt = await generateSalt();
    const original = "Hello, this is a secret note!";

    const { ciphertext, iv } = await encrypt(original, password, salt);
    expect(ciphertext).toBeTruthy();
    expect(iv).toBeTruthy();

    const decrypted = await decrypt(ciphertext, password, salt, iv);
    expect(decrypted).toBe(original);
  });

  it("handles empty strings", async () => {
    const password = "password";
    const salt = await generateSalt();
    const { ciphertext, iv } = await encrypt("", password, salt);
    const decrypted = await decrypt(ciphertext, password, salt, iv);
    expect(decrypted).toBe("");
  });

  it("handles special characters and unicode", async () => {
    const password = "p@ssw0rd!";
    const salt = await generateSalt();
    const original = "你好世界 🎉 100% \n\t";

    const { ciphertext, iv } = await encrypt(original, password, salt);
    const decrypted = await decrypt(ciphertext, password, salt, iv);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", async () => {
    const password = "password";
    const salt = await generateSalt();
    const text = "same text";

    const r1 = await encrypt(text, password, salt);
    const r2 = await encrypt(text, password, salt);

    expect(r1.ciphertext).not.toBe(r2.ciphertext);
    expect(r1.iv).not.toBe(r2.iv);
  });
});

describe("decrypt error handling", () => {
  it("fails with wrong password", async () => {
    const salt = await generateSalt();
    const { ciphertext, iv } = await encrypt("secret", "correct-password", salt);

    await expect(decrypt(ciphertext, "wrong-password", salt, iv)).rejects.toThrow();
  });

  it("fails with wrong salt", async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();
    const { ciphertext, iv } = await encrypt("secret", "password", salt1);

    await expect(decrypt(ciphertext, "password", salt2, iv)).rejects.toThrow();
  });

  it("fails with wrong IV", async () => {
    const salt = await generateSalt();
    const { ciphertext } = await encrypt("secret", "password", salt);

    await expect(decrypt(ciphertext, "password", salt, "AAAA" + "==")).rejects.toThrow();
  });
});
