import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignmentRepository } from '../AssignmentRepository';
import { supabase } from '../../../../lib/supabase';

// Mock Supabase client
vi.mock('../../../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
        })),
    },
}));

describe('AssignmentRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an assignment', async () => {
        const mockData = { id: '1', leader_id: 'l1', test_id: 't1', organization_id: 'o1' };

        // Setup mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
        const selectMock = vi.fn().mockReturnValue({ single: singleMock });
        const insertMock = vi.fn().mockReturnValue({ select: selectMock });
        const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

        (supabase.from as any).mockImplementation(fromMock);

        const { data, error } = await assignmentRepository.create('l1', 't1', 'o1');

        expect(supabase.from).toHaveBeenCalledWith('assignments');
        expect(insertMock).toHaveBeenCalledWith({
            leader_id: 'l1',
            test_id: 't1',
            organization_id: 'o1'
        });
        expect(data).toEqual(mockData);
        expect(error).toBeNull();
    });

    it('should list assignments by leader', async () => {
        const mockData = [{ id: '1', leader_id: 'l1' }];

        // Setup mock chain
        const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        (supabase.from as any).mockImplementation(fromMock);

        const { data, error } = await assignmentRepository.listByLeader('l1');

        expect(supabase.from).toHaveBeenCalledWith('assignments');
        expect(selectMock).toHaveBeenCalledWith('*, test:tests(title, description)');
        expect(eqMock).toHaveBeenCalledWith('leader_id', 'l1');
        expect(data).toEqual(mockData);
        expect(error).toBeNull();
    });

    it('should mark assignment as completed', async () => {
        // Setup mock chain
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ update: updateMock });

        (supabase.from as any).mockImplementation(fromMock);

        const { error } = await assignmentRepository.markAsCompleted('1');

        expect(supabase.from).toHaveBeenCalledWith('assignments');
        expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
            completed_at: expect.any(String)
        }));
        expect(eqMock).toHaveBeenCalledWith('id', '1');
        expect(error).toBeNull();
    });
});
