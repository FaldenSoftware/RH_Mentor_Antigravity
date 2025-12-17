import { supabase } from '../../../lib/supabase';

export interface Result {
    id: string;
    assignment_id: string;
    user_id: string;
    answers: Record<string, string>; // questionId -> optionType
    score: Record<string, number>;   // D: 10, I: 5...
    created_at: string;
}

export class ResultRepository {
    async create(assignmentId: string, userId: string, answers: any, score: any): Promise<{ data: Result | null; error: any }> {
        const { data, error } = await supabase
            .from('results')
            .insert({
                assignment_id: assignmentId,
                user_id: userId,
                answers,
                score
            })
            .select()
            .single();

        return { data, error };
    }

    async getByAssignmentId(assignmentId: string): Promise<{ data: Result | null; error: any }> {
        const { data, error } = await supabase
            .from('results')
            .select('*')
            .eq('assignment_id', assignmentId)
            .single();

        return { data, error };
    }

}

export const resultRepository = new ResultRepository();
