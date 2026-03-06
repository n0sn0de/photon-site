import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TokenIcon } from "@/components/token-icon";

afterEach(cleanup);

describe("TokenIcon", () => {
  it("renders photon icon with correct src", () => {
    render(<TokenIcon token="photon" />);
    const img = screen.getByAltText("PHOTON");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/assets/photon.svg");
  });

  it("renders atone icon with correct src", () => {
    render(<TokenIcon token="atone" />);
    const img = screen.getByAltText("ATONE");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/assets/atone.svg");
  });

  it("applies custom size", () => {
    render(<TokenIcon token="photon" size={32} />);
    const img = screen.getByAltText("PHOTON");
    expect(img.getAttribute("width")).toBe("32");
    expect(img.getAttribute("height")).toBe("32");
  });

  it("applies custom className", () => {
    render(<TokenIcon token="atone" className="my-custom-class" />);
    const img = screen.getByAltText("ATONE");
    expect(img.className).toContain("my-custom-class");
  });
});
