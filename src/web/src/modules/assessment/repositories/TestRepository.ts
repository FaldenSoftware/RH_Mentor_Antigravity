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

export class TestRepository {
    async list(): Promise<{ data: Test[] | null; error: any }> {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .order('created_at', { ascending: false });

        return { data, error };
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
