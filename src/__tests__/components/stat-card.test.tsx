import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/stat-card";

describe("StatCard", () => {
  it("renders icon, title, and value", () => {
    render(<StatCard icon="◎" title="PHOTON Supply" value="74,000,000" />);
    expect(screen.getByText("◎")).toBeInTheDocument();
    expect(screen.getByText("PHOTON Supply")).toBeInTheDocument();
    expect(screen.getByText("74,000,000")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(
      <StatCard
        icon="⬡"
        title="ATONE Supply"
        value="136,000,000"
        sub="Total circulating"
      />
    );
    expect(screen.getByText("Total circulating")).toBeInTheDocument();
  });

  it("renders footer text when provided", () => {
    render(
      <StatCard
        icon="◎"
        title="Supply"
        value="74M"
        footer="7.4% minted"
      />
    );
    expect(screen.getByText("7.4% minted")).toBeInTheDocument();
  });

  it("renders progress bar when progress provided", () => {
    const { container } = render(
      <StatCard icon="◎" title="Supply" value="74M" progress={7.4} />
    );
    const fill = container.querySelector(".progress-fill");
    expect(fill).toBeInTheDocument();
    expect(fill?.getAttribute("style")).toContain("7.4%");
  });
});
