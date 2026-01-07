
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioOverview } from './data';

const mocks = vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockSingle = vi.fn();
    const mockOrder = vi.fn();

    // Recursive builder setup
    const mockBuilder: any = {
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        order: mockOrder,
        then: vi.fn()
    };

    mockSelect.mockReturnValue(mockBuilder);
    mockEq.mockReturnValue(mockBuilder);
    mockOrder.mockReturnValue(mockBuilder);

    const mockFrom = vi.fn(() => mockBuilder);

    return {
        mockSelect,
        mockEq,
        mockSingle,
        mockOrder,
        mockFrom,
        mockBuilder, // Export builder to mock "then" responses
        mockSupabase: {
            from: mockFrom
        }
    }
});

vi.mock('./supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mocks.mockSupabase))
}));

describe('getPortfolioOverview', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calculates KPIs correctly', async () => {
        // Queue responses for the sequential awaits in the function

        // 1. Funds
        mocks.mockBuilder.then.mockImplementationOnce((resolve: any) => resolve({
            data: [
                { name: 'Fund I', committed_capital: 1000 },
                { name: 'Fund II', committed_capital: 2000 }
            ]
        }));

        // 2. Transactions
        mocks.mockBuilder.then.mockImplementationOnce((resolve: any) => resolve({
            data: [
                { amount_invested: 500, funds: { name: 'Fund I' } },
                { amount_invested: 300, funds: { name: 'Fund II' } }
            ]
        }));

        // 3. Active Companies (chained .eq)
        mocks.mockBuilder.then.mockImplementationOnce((resolve: any) => resolve({
            count: 5,
            data: []
        }));

        // 4. Portfolio (chained .order)
        mocks.mockBuilder.then.mockImplementationOnce((resolve: any) => resolve({
            data: [
                { id: '1', name: 'Comp A', financing_rounds: [] }
            ]
        }));

        const result = await getPortfolioOverview();

        expect(result.kpis.totalAum).toBe(3000); // 1000 + 2000
        expect(result.kpis.capitalDeployed).toBe(800); // 500 + 300
        expect(result.kpis.activeCompanies).toBe(5);
    });
});
