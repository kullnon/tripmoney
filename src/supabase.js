import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rthpayyevlloxsbzfxuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aHBheXlldmxsb3hzYnpmeHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5Njc2MjYsImV4cCI6MjA5MjU0MzYyNn0.lZrOxtosNZTVSChpqy8_shIX7LYFDC48KZzFDc15dRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
