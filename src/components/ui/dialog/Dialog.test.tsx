import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

afterEach(() => {
  cleanup();
});

describe('Dialog', () => {
  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog isOpen title="How it works" onClose={onClose}>
        <p>Details</p>
      </Dialog>,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <Dialog isOpen={false} title="How it works" onClose={() => {}}>
        <p>Details</p>
      </Dialog>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('traps focus with Tab and Shift+Tab while open', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog isOpen title="How it works" onClose={onClose}>
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: /How it works/i });
    const closeButton = within(dialog).getByRole('button', { name: /^Close$/i });
    const firstAction = within(dialog).getByRole('button', { name: /First action/i });
    const secondAction = within(dialog).getByRole('button', { name: /Second action/i });

    closeButton.focus();
    await user.tab({ shift: true });
    expect(secondAction).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    secondAction.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    firstAction.focus();
    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it('closes from the backdrop and cleans up listeners on unmount', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { unmount } = render(
      <Dialog isOpen title="How it works" onClose={onClose}>
        <p>Details</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: /How it works/i });
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('wraps Shift+Tab to the last control when focus is outside the dialog', () => {
    const onClose = vi.fn();

    render(
      <>
        <button type="button">Outside</button>
        <Dialog isOpen title="How it works" onClose={onClose}>
          <button type="button">Inside</button>
        </Dialog>
      </>,
    );

    const outside = screen.getByRole('button', { name: /Outside/i });
    const dialog = screen.getByRole('dialog', { name: /How it works/i });
    const closeButton = within(dialog).getByRole('button', { name: /^Close$/i });
    outside.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(closeButton).toHaveFocus();
  });
});
