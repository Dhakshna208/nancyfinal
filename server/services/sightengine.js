const axios = require('axios');
const FormData = require('form-data');

class SightengineService {
  constructor() {
    this.apiUser = process.env.SIGHTENGINE_API_USER;
    this.apiSecret = process.env.SIGHTENGINE_API_SECRET;
    this.baseUrl = 'https://api.sightengine.com';
  }

  async analyzeImage(imagePath) {
    try {
      const form = new FormData();
      form.append('media', require('fs').createReadStream(imagePath));
      form.append('models', 'deepfake,ai-generated,nudity,weapon, drugs,text-content,face-2-simpson');
      form.append('api_user', this.apiUser);
      form.append('api_secret', this.apiSecret);

      const response = await axios.post(`${this.baseUrl}/1.1/check.json`, form, {
        headers: form.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Sightengine API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to analyze image with Sightengine');
    }
  }

  extractAIDetection(data) {
    const aiGenerated = data?.ai_generated || data?.deepfake || {};
    
    return {
      isAIGenerated: aiGenerated?.prob > 0.5 || null,
      confidence: aiGenerated?.prob ? Math.round(aiGenerated.prob * 100) : null,
      rawData: aiGenerated
    };
  }

  extractManipulationDetection(data) {
    const nudity = data?.nudity || {};
    const weapon = data?.weapon || {};
    const drugs = data?.drugs || {};
    
    let isManipulated = null;
    let type = null;
    let confidence = null;

    if (nudity?.prob && nudity.prob > 0.5) {
      isManipulated = true;
      type = 'nudity';
      confidence = Math.round(nudity.prob * 100);
    } else if (weapon?.prob && weapon.prob > 0.5) {
      isManipulated = true;
      type = 'weapon';
      confidence = Math.round(weapon.prob * 100);
    } else if (drugs?.prob && drugs.prob > 0.5) {
      isManipulated = true;
      type = 'drugs';
      confidence = Math.round(drugs.prob * 100);
    }

    return {
      isManipulated,
      type,
      confidence,
      rawData: { nudity, weapon, drugs }
    };
  }

  async analyzeWithFallback(imagePath) {
    try {
      const result = await this.analyzeImage(imagePath);
      return {
        success: true,
        data: result,
        aiDetection: this.extractAIDetection(result),
        manipulationDetection: this.extractManipulationDetection(result)
      };
    } catch (error) {
      console.error('Sightengine analysis failed, using fallback:', error.message);
      return {
        success: false,
        error: error.message,
        aiDetection: { isAIGenerated: null, confidence: null, rawData: null },
        manipulationDetection: { isManipulated: null, type: null, confidence: null, rawData: null }
      };
    }
  }
}

module.exports = new SightengineService();
