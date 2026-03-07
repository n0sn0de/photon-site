import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversionChart } from "@/components/conversion-chart";

describe("ConversionChart", () => {
  const defaultProps = {
    currentPhotonSupply: 73_795_684,
    atoneSupply: 136_800_995,
    simulatedMint: 0,
  };

  it("renders SVG with aria label", () => {
    const { container } = render(<ConversionChart {...defaultProps} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("aria-label")).toBe("PHOTON conversion rate curve");
  });

  it("shows current rate label", () => {
    const { container } = render(<ConversionChart {...defaultProps} />);
    const texts = container.querySelectorAll("text");
    const nowLabel = Array.from(texts).find((t) => t.textContent?.startsWith("Now:"));
    expect(nowLabel).toBeDefined();
  });

  it("shows axis labels", () => {
    const { container } = render(<ConversionChart {...defaultProps} />);
    const texts = Array.from(container.querySelectorAll("text")).map(
      (t) => t.textContent
    );
    expect(texts).toContain("PHOTON Supply");
    expect(texts).toContain("Rate (PHOTON per ATONE)");
  });

  it("shows simulated point when simulatedMint > 0", () => {
    const { container } = render(
      <ConversionChart {...defaultProps} simulatedMint={100_000_000} />
    );
    // Should have two circles (current + simulated)
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("does not show simulated point when simulatedMint is 0", () => {
    const { container } = render(
      <ConversionChart {...defaultProps} simulatedMint={0} />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(1); // only current
  });
});
