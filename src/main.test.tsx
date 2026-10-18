import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';

// Keep track of the mock render function so we can assert on it
const mockRender = vi.fn();

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: mockRender,
  })),
}));

// Mock App component
vi.mock('./App.tsx', () => ({
  default: () => <div>Mock App</div>,
}));

describe('main.tsx', () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Suppress console.error during tests
    originalConsoleError = console.error;
    console.error = vi.fn();

    // Clear DOM and mocks before each test
    document.body.innerHTML = '';
    vi.clearAllMocks();

    // reset module cache to re-execute main.tsx
    vi.resetModules();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should render the App component when the root element is found', async () => {
    // Create root element
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Dynamic import to execute the script after setting up the DOM
    await import('./main');

    expect(createRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalled();
  });

  it('should log an error when the root element is not found', async () => {
    // Do NOT create root element here

    // Dynamic import to execute the script
    await import('./main');

    expect(createRoot).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Failed to find the root element');
  });
});
