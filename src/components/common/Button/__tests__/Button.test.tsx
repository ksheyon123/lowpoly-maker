import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders button with correct text", () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
