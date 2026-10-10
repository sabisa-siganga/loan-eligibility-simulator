import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

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
});
