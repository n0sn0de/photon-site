import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PhotonParticles } from "@/components/photon-particles";

describe("PhotonParticles", () => {
  it("renders a canvas element", () => {
    const { container } = render(<PhotonParticles />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("has aria-hidden for accessibility", () => {
    const { container } = render(<PhotonParticles />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("is pointer-events-none", () => {
    const { container } = render(<PhotonParticles />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.className).toContain("pointer-events-none");
  });
});
