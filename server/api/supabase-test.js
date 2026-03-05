const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('products').select('*').limit(1);

    if (error) {
        return res.status(500).json({ error: 'Supabase test failed', details: error });
    }

    res.json({ message: 'Supabase test successful!', data });
};
