const axios = require('axios');

// Get image suggestion from Unsplash
const getImageSuggestion = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return res.status(500).json({ error: 'Image suggestion service not configured' });
    }

    // Fetch random photo from Unsplash based on query
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: query,
        orientation: 'landscape',
        w: 1200,
        h: 800
      },
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    const imageUrl = response.data.urls?.regular || response.data.urls?.full;

    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to fetch image' });
    }

    res.json({
      url: imageUrl,
      photographer: response.data.user?.name,
      unsplashUrl: response.data.links?.html
    });
  } catch (error) {
    console.error('Image suggestion error:', error.message);
    if (error.response) {
      console.error('Unsplash API error:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch image suggestion' });
  }
};

module.exports = {
  getImageSuggestion
};
