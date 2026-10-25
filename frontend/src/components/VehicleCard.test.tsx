import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '../types';

const car: Vehicle = { id: 1, make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 };
const handlers = () => ({ onPurchase: vi.fn(), onEdit: vi.fn(), onRestock: vi.fn(), onDelete: vi.fn() });

describe('<VehicleCard />', () => {
  it('shows make, model, category, formatted price and stock', () => {
    render(<VehicleCard vehicle={car} isAdmin={false} {...handlers()} />);
    expect(screen.getByRole('heading', { name: /honda civic/i })).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText(/₹\s*22,000/)).toBeInTheDocument();
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument();
  });

  it('calls onPurchase when the Purchase button is clicked', async () => {
    const h = handlers();
    render(<VehicleCard vehicle={car} isAdmin={false} {...h} />);
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(h.onPurchase).toHaveBeenCalledWith(car);
  });

  it('disables Purchase and shows "Sold out" when quantity is zero', () => {
    render(<VehicleCard vehicle={{ ...car, quantity: 0 }} isAdmin={false} {...handlers()} />);
    expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled();
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('hides admin controls from regular users', () => {
    render(<VehicleCard vehicle={car} isAdmin={false} {...handlers()} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restock/i })).not.toBeInTheDocument();
  });

  it('shows edit / restock / delete to admins and wires the callbacks', async () => {
    const h = handlers();
    render(<VehicleCard vehicle={car} isAdmin {...h} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /restock/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(h.onEdit).toHaveBeenCalledWith(car);
    expect(h.onRestock).toHaveBeenCalledWith(car);
    expect(h.onDelete).toHaveBeenCalledWith(car);
  });
});
