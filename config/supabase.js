require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key loaded:', supabaseKey ? 'Yes' : 'No');

// Create Supabase client with default settings
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
supabase.from('projects').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection error:', error.message);
    } else {
      console.log('Supabase connected successfully! Projects count:', count);
    }
  })
  .catch(err => console.error('Supabase connection failed:', err.message));

module.exports = supabase;
