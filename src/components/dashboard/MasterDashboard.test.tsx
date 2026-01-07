
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MasterDashboard } from './MasterDashboard';

vi.mock('lucide-react', () => ({
    ArrowUpRight: () => <svg data-testid="ArrowUpRight" />,
    ArrowDownRight: () => <svg data-testid="ArrowDownRight" />,
    ArrowRight: () => <svg data-testid="ArrowRight" />,
    PieChart: () => <svg data-testid="PieChart" />,
    ChevronRight: () => <svg data-testid="ChevronRight" />,
    Users: () => <svg data-testid="Users" />,
    Activity: () => <svg data-testid="Activity" />,
    DollarSign: () => <svg data-testid="DollarSign" />,
    TrendingUp: () => <svg data-testid="TrendingUp" />
}));

describe('MasterDashboard', () => {
    const mockKpis = {
        totalAum: 50000000,
        capitalDeployed: 15000000,
        activeCompanies: 3
    };

    const mockDeployments = [
        { name: 'Fund I', deployed: 10000000, total: 20000000, vintage: '2020' }
    ];

    const mockPortfolio = [
        { id: '1', name: 'Test Comp', sector: 'AI', stage: 'Seed', invested: 1000000, ownership: 10, country: 'USA', status: 'Active', fundNames: ['Fund I'] }
    ];

    it('renders KPIs correctly', () => {
        render(<MasterDashboard kpis={mockKpis} deployments={mockDeployments} portfolio={mockPortfolio} />);

        // Check for specific values formatted (e.g. $50M)
        expect(screen.getByText('$50M')).toBeDefined();
        expect(screen.getByText('$15M')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
    });

    it('renders portfolio table', () => {
        render(<MasterDashboard kpis={mockKpis} deployments={mockDeployments} portfolio={mockPortfolio} />);

        expect(screen.getByText('Test Comp')).toBeDefined();
        expect(screen.getByText('AI')).toBeDefined();
    });
});
