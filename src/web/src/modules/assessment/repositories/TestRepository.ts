import { supabase } from '../../../lib/supabase';

export interface QuestionOption {
    text: string;
    type: 'D' | 'I' | 'S' | 'C';
}

export interface Question {
    id: number;
    text: string;
    options: QuestionOption[];
}

export interface Test {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    created_at: string;
}

export interface TestSummary {
    id: string;
    title: string;
    description: string;
    created_at: string;
}

export class TestRepository {
    async list(page: number = 1, limit: number = 10): Promise<{ data: TestSummary[] | null; count: number | null; error: any }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('tests')
            .select('id, title, description, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        return { data, count, error };
    }

    async getById(id: string): Promise<{ data: Test | null; error: any }> {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('id', id)
            .single();

        return { data, error };
    }
}

export const testRepository = new TestRepository();
