const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPlaceholder = (val) => !val || val.includes('your_');

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey)) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Supabase credentials are still placeholders in .env');
  console.error('\x1b[33m%s\x1b[0m', 'Please update SUPABASE_URL and SUPABASE_KEY in server/.env with your actual project details.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use this for administrative tasks that bypass RLS
let supabaseAdmin = null;
if (!isPlaceholder(supabaseServiceKey)) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = { supabase, supabaseAdmin };
