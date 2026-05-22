// Test helper: render a component inside a MemoryRouter so react-router
// primitives (Link, useNavigate, etc.) work under jsdom.
// (This helper is owned by 2026-05-22-student-dashboard.md Task 1; created here
// because that sibling plan is not present in this worktree.)
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(ui, { route = '/', ...options } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, options);
}
