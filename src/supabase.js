import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctysqawmqjgyutpofetu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0eXNxYXdtcWpneXV0cG9mZXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzEzNzMsImV4cCI6MjA5MTQ0NzM3M30.5rLRoAgTlicMPYD3m4Y2NaSVc-6m0Ib6FuTCx9HJw3M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
