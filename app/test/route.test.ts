import { describe, expect, it } from "vitest";

import { parseRoute } from "../src/route";

describe("parseRoute", () => {
  it("defaults to the gallery for an empty hash", () => {
    expect(parseRoute("")).toEqual({ name: "gallery" });
  });

  it("defaults to the gallery for the root hash", () => {
    expect(parseRoute("#/")).toEqual({ name: "gallery" });
  });

  it("parses a notebook id", () => {
    expect(parseRoute("#/n/bmw")).toEqual({ name: "notebook", id: "bmw" });
  });

  it("accepts hyphenated and underscored ids", () => {
    expect(parseRoute("#/n/werner-quantity-theory_credit")).toEqual({
      name: "notebook",
      id: "werner-quantity-theory_credit"
    });
  });

  it("falls back to the gallery for an unknown route shape", () => {
    expect(parseRoute("#/notebook/bmw")).toEqual({ name: "gallery" });
  });

  it("rejects notebook ids containing illegal characters", () => {
    expect(parseRoute("#/n/bad id")).toEqual({ name: "gallery" });
    expect(parseRoute("#/n/bad/extra")).toEqual({ name: "gallery" });
  });
});
