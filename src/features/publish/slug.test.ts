import { describe, expect, it } from "vitest";
import { createBaseSlug } from "./slug";

describe("createBaseSlug", () => {
  it("creates lowercase slugs from titles", () => {
    expect(createBaseSlug("Booking CRM")).toBe("booking-crm");
  });

  it("falls back when the title has no letters or numbers", () => {
    expect(createBaseSlug("!!!")).toBe("atoms-app");
  });
});
