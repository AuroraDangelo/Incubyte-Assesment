import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VehicleFormModal from './VehicleFormModal';

describe('<VehicleFormModal />', () => {
  it('submits a new vehicle with numeric price and quantity', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<VehicleFormModal onSubmit={onSubmit} onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Kia');
    await userEvent.type(screen.getByLabelText(/model/i), 'EV6');
    await userEvent.type(screen.getByLabelText(/category/i), 'Electric');
    await userEvent.type(screen.getByLabelText(/price/i), '45000');
    await userEvent.type(screen.getByLabelText(/quantity/i), '4');
    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(onSubmit).toHaveBeenCalledWith({ make: 'Kia', model: 'EV6', category: 'Electric', price: 45000, quantity: 4 });
  });

  it('pre-fills the form when editing and labels the button "Save changes"', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const initial = { id: 7, make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 };
    render(<VehicleFormModal initial={initial} onSubmit={onSubmit} onClose={vi.fn()} />);
    expect(screen.getByLabelText(/make/i)).toHaveValue('Honda');
    await userEvent.clear(screen.getByLabelText(/price/i));
    await userEvent.type(screen.getByLabelText(/price/i), '21000');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(onSubmit).toHaveBeenCalledWith({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 });
  });

  it('blocks submit and shows an error for invalid numbers', async () => {
    const onSubmit = vi.fn();
    render(<VehicleFormModal onSubmit={onSubmit} onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Kia');
    await userEvent.type(screen.getByLabelText(/model/i), 'EV6');
    await userEvent.type(screen.getByLabelText(/category/i), 'Electric');
    await userEvent.type(screen.getByLabelText(/price/i), '-5');
    await userEvent.type(screen.getByLabelText(/quantity/i), '2');
    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/price/i);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<VehicleFormModal onSubmit={vi.fn()} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
