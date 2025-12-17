// supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://tbeucdgyoifjbxqdinzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZXVjZGd5b2lmamJ4cWRpbnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNjg1MTEsImV4cCI6MjA4MDc0NDUxMX0.Ayl5us8nZCpR-NMcUqiQyDvlJ4ybWi8yAcgxqls2-VA";

// Crear cliente global
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

