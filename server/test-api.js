const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function main() {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        console.log('API Connected! All users:', data.map(u => ({ email: u.email, role: u.role })));
    } catch (e) {
        console.error('API failed:', e);
    }
}
main();
