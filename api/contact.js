export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, subject } = req.body;
    
    // Log the lead (visible in Vercel logs)
    console.log('=== NEW LEAD ===');
    console.log('Name:', name);
    console.log('Phone:', phone);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Time:', new Date().toISOString());
    console.log('================');

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
