const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SerpApiService {
  constructor() {
    this.apiKey = process.env.SERPAPI_KEY;
    this.baseUrl = 'https://serpapi.com/search';
  }

  async searchByImage(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      const response = await axios.post(this.baseUrl, {
        engine: 'google_lens',
        url: dataUri,
        api_key: this.apiKey
      });

      return response.data;
    } catch (error) {
      console.error('SerpApi Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to perform reverse image search');
    }
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  extractSimilarImages(data) {
    const similarImages = [];
    
    try {
      const visualMatches = data?.visual_matches || [];
      const imageResults = data?.image_results || [];
      
      const allResults = [...visualMatches, ...imageResults];
      
      for (const result of allResults.slice(0, 10)) {
        similarImages.push({
          title: result.title || 'No title',
          link: result.link || result.image?.link || '',
          source: result.source || result.domain || '',
          thumbnail: result.thumbnail || result.image?.thumbnail || result.img || ''
        });
      }
    } catch (error) {
      console.error('Error extracting similar images:', error);
    }

    return similarImages;
  }

  async searchWithFallback(imagePath) {
    try {
      const result = await this.searchByImage(imagePath);
      return {
        success: true,
        data: result,
        similarImages: this.extractSimilarImages(result)
      };
    } catch (error) {
      console.error('SerpApi search failed, using fallback:', error.message);
      return {
        success: false,
        error: error.message,
        similarImages: []
      };
    }
  }
}

module.exports = new SerpApiService();
