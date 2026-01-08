
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { upsertRound } from './actions';
import { createClient } from '@/lib/supabase/server';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock Supabase Server Client
const mockInsert = vi.fn();
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn((table) => {
    return {
        select: mockSelect,
        insert: mockInsert,
        upsert: mockUpsert,
        delete: mockDelete,
    };
});

mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ maybeSingle: mockSingle, single: mockSingle });
mockSingle.mockResolvedValue({ data: { id: 'round-123' }, error: null });
mockUpsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
mockInsert.mockResolvedValue({ error: null });
mockDelete.mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: mockFrom,
    })),
}));

describe('Server Actions: upsertRound', () => {
    it('should return error if date is missing', async () => {
        const mockData = {
            roundTerms: {
                stage: 'Series A',
                date: '', // EMPTY STRING - Should trigger validation error
                valuation: '$10,000,000',
                pps: '$1.00',
                capitalRaised: '$2,000,000'
            },
            position: {
                participated: false,
                hasWarrants: false
            }
        };

        const result = await upsertRound(mockData, 'company-123');

        // createClient IS called at start of function
        expect(createClient).toHaveBeenCalled();
        // But mockUpsert should NOT be called.
        expect(mockUpsert).not.toHaveBeenCalled();
        expect(result).toEqual({ error: 'Round Date is required.' });
    });

    it('should handle "Jan 2024" date string by converting to valid date', async () => {
        const mockData = {
            roundTerms: {
                stage: 'Series B',
                date: 'Jan 2024', // Problematic format
                valuation: '$20M',
                pps: '$2.00',
                capitalRaised: '$5M'
            },
            position: { participated: false }
        };

        await upsertRound(mockData, 'company-456');

        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            // Should convert to something valid. 
            // "Jan 2024" -> "2024-01-01" (approx)
            // Just checking it is NOT "Jan 2024"
            close_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/)
        }));
    });

    it('should handle valid dates correctly', async () => {
        const mockData = {
            roundTerms: {
                stage: 'Series B',
                date: '2025-01-01',
                valuation: '$20,000,000',
                pps: '$2.00',
                capitalRaised: '$5,000,000'
            },
            position: { participated: false }
        };

        await upsertRound(mockData, 'company-123');

        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            close_date: '2025-01-01',
        }));
    });
    it('should update existing round if ID is provided', async () => {
        const mockData = {
            id: 'round-existing-123',
            roundTerms: {
                stage: 'Series B',
                date: '2024-01-01',
                valuation: '$20M',
                pps: '$2.00',
                capitalRaised: '$5M'
            },
            position: { participated: false }
        };

        await upsertRound(mockData, 'company-456');

        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            id: 'round-existing-123', // ID should be passed to upsert
            round_label: 'Series B'
        }));
    });
});
