import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../Input";

describe("Input Component", () => {
  it("renders input with label correctly", () => {
    render(<Input label="Username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("handles onChange event correctly", async () => {
    const handleChange = jest.fn();
    render(<Input label="Username" onChange={handleChange} />);

    const inputElement = screen.getByRole("textbox");
    await userEvent.type(inputElement, "test");

    expect(handleChange).toHaveBeenCalled();
    expect(inputElement).toHaveValue("test");
  });

  it("displays error message when error prop is provided", () => {
    render(<Input label="Username" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies error styles when error prop is provided", () => {
    render(<Input error="Error" />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveClass("border-red-500");
  });

  it("applies custom className correctly", () => {
    render(<Input className="custom-class" />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveClass("custom-class");
  });

  it("handles input focus correctly", async () => {
    const handleFocus = jest.fn();
    render(<Input onFocus={handleFocus} />);

    const inputElement = screen.getByRole("textbox");
    await userEvent.click(inputElement);

    expect(handleFocus).toHaveBeenCalled();
  });

  it("handles multiple character inputs correctly", async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const inputElement = screen.getByRole("textbox");
    await userEvent.type(inputElement, "Hello World");

    expect(handleChange).toHaveBeenCalledTimes(11); // 'Hello World'는 11글자
    expect(inputElement).toHaveValue("Hello World");
  });

  it("clears input value correctly", async () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);

    const inputElement = screen.getByRole("textbox");
    await userEvent.type(inputElement, "test");
    await userEvent.clear(inputElement);

    expect(inputElement).toHaveValue("");
  });
});
