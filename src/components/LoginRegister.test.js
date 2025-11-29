// FILEPATH: /Users/sbecker11/workspace-react/react-app/src/components/LoginRegister.test.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react'; 
import { TestRouter } from '../test-utils';
import LoginRegister from './LoginRegister';

export const onLoginRegisterClick = jest.fn();

describe('LoginRegister', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
    });

    it('displays the LoginRegister heading', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        expect(screen.getByText('LoginRegister')).toBeInTheDocument();
    });

    it('renders email input field', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'text');
    });

    it('renders password input field', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders Clear and Save buttons', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        expect(screen.getByText('Clear')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('updates email input when user types', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password input when user types', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
        expect(passwordInput).toHaveValue('Test123!');
    });

    it('clears form fields when Clear button is clicked', () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
        
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
        
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    it('shows email validation error for invalid email', async () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const emailInput = screen.getByLabelText(/email/i);
        const saveButton = screen.getByText('Save');
        
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
        });
    });

    it('shows password validation error for weak password', async () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const passwordInput = screen.getByLabelText(/password/i);
        const saveButton = screen.getByText('Save');
        
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(screen.getByText(/Password must meet criteria/i)).toBeInTheDocument();
        });
    });

    it('validates password requirements', async () => {
        render(<TestRouter><LoginRegister /></TestRouter>);
        const passwordInput = screen.getByLabelText(/password/i);
        const saveButton = screen.getByText('Save');
        
        // Test password without uppercase
        fireEvent.change(passwordInput, { target: { value: 'test123!' } });
        fireEvent.click(saveButton);
        await waitFor(() => {
            expect(screen.getByText(/Password must meet criteria/i)).toBeInTheDocument();
        });
    });
});

