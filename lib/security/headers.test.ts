import { describe, expect, it } from "vitest";
import { securityHeaders } from "./headers";

const header = (headers: { key: string; value: string }[], key: string) =>
  headers.find((h) => h.key === key)?.value;

describe("securityHeaders", () => {
  it("locks the page to its own origin and forbids framing", () => {
    const csp = header(
      securityHeaders({ dev: false, https: true }),
      "Content-Security-Policy",
    );
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows eval only in development, and HTTPS-only headers only on HTTPS", () => {
    const dev = securityHeaders({ dev: true, https: false });
    expect(header(dev, "Content-Security-Policy")).toContain("'unsafe-eval'");
    expect(header(dev, "Content-Security-Policy")).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(header(dev, "Strict-Transport-Security")).toBeUndefined();
  });

  it("sets the standard hardening headers", () => {
    const headers = securityHeaders({ dev: false, https: true });
    expect(header(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(headers, "X-Frame-Options")).toBe("DENY");
    expect(header(headers, "Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(header(headers, "Strict-Transport-Security")).toMatch(/max-age=/);
  });
});
