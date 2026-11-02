import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksogsdazqqghroshrrmc.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_Ni988vuFUu8a7tK3CYocjg_ALMrJRqK';

export const supabase = createClient(supabaseUrl, supabaseKey);