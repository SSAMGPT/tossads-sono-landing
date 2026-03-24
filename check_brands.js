const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://rbliwhiibewihqlpmihd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_n0rEJFTn6Qu12Ui_qDO8bw_sSVJbTR-';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkBrands() {
  const { data, error } = await supabase.from('products').select('brand');
  if (error) console.error(error);
  else {
    const brands = [...new Set(data.map(d => d.brand).filter(Boolean))];
    console.log('Brands in DB:', brands);
  }
}
checkBrands();
