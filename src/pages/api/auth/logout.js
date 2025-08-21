export default async function handler(req, res) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    // Clear the token cookie
    const cookieSettings = process.env.NODE_ENV === 'production' 
      ? `token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure`
      : `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
      
    res.setHeader('Set-Cookie', cookieSettings);
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
