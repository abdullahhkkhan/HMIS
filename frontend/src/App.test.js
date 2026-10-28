import { render, screen } from "@testing-library/react";
import App from "./App";

test("shows the sign-in page when logged out", () => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
  render(<App />);
  expect(screen.getByText(/Sign in to HMIS/i)).toBeInTheDocument();
});
