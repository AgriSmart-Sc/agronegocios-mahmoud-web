import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lemnucxvfkhmlnnxrwvyh.supabase.co";

const supabaseKey = "sb_publishable_7wb7LKq06Vvws7AOhNhNzQ_Ro4RuShH";

export const supabase = createClient(supabaseUrl, supabaseKey);
