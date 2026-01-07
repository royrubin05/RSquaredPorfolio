
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompanyList, PortfolioCompany } from './CompanyList';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    ArrowUpRight: () => <div data-testid="ArrowUpRight" />,
    Link: () => <div data-testid="Link" />,
    MoreHorizontal: () => <div data-testid="MoreHorizontal" />,
    Filter: () => <div data-testid="Filter" />,
    Plus: () => <div data-testid="Plus" />,
    Pencil: () => <div data-testid="Pencil" />,
    FileText: () => <div data-testid="FileText" />,
    Search: () => <div data-testid="Search" />,
    Trash2: () => <div data-testid="Trash2" />,
    Settings: () => <div data-testid="Settings" />
}));

// Mock CompanyCreationModal
vi.mock('../dashboard/CompanyCreationModal', () => ({
    CompanyCreationModal: () => <div data-testid="CompanyCreationModal" />
}));

// Mock Server Actions
vi.mock("@/app/actions", () => ({
    getCompanyStatuses: vi.fn().mockResolvedValue(['Active', 'Exit', 'Watchlist']),
    upsertCompany: vi.fn(), // Missing methods added
    deleteCompany: vi.fn(),
    saveCompanyStatuses: vi.fn()
}));

describe('CompanyList', () => {
    const mockCompanies: PortfolioCompany[] = [
        { id: '1', name: 'Alpha AI', sector: 'AI', stage: 'Series A', invested: 1000, ownership: 10, fundNames: ['Fund I'], status: 'Active' },
        { id: '2', name: 'Beta Bio', sector: 'Bio', stage: 'Seed', invested: 500, ownership: 5, fundNames: ['Fund II'], status: 'Active' },
        { id: '3', name: 'Gamma Svc', sector: 'SaaS', stage: 'Series B', invested: 2000, ownership: 15, fundNames: ['Fund I', 'Fund II'], status: 'Active' },
    ];

    it('renders all companies initially', () => {
        render(<CompanyList initialCompanies={mockCompanies} />);
        expect(screen.getByText('Alpha AI')).toBeDefined();
        expect(screen.getByText('Beta Bio')).toBeDefined();
        expect(screen.getByText('Gamma Svc')).toBeDefined();
    });

    it('filters by Fund I', () => {
        render(<CompanyList initialCompanies={mockCompanies} />);

        // Ensure all are present initially
        expect(screen.getByText('Alpha AI')).toBeDefined();
        expect(screen.getByText('Beta Bio')).toBeDefined();
        expect(screen.getByText('Gamma Svc')).toBeDefined();

        // Change filter
        const select = screen.getByDisplayValue('All Funds');
        fireEvent.change(select, { target: { value: 'Fund I' } });

        // Expect Alpha (Fund I) and Gamma (Fund I & II) to stay
        expect(screen.getByText('Alpha AI')).toBeDefined();
        expect(screen.getByText('Gamma Svc')).toBeDefined();

        // Expect Beta (Fund II only) to disappear
        expect(screen.queryByText('Beta Bio')).toBeNull();
    });
});
