const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  aiDetection: {
    isAIGenerated: {
      type: Boolean,
      default: null
    },
    confidence: {
      type: Number,
      default: null
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  manipulationDetection: {
    isManipulated: {
      type: Boolean,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    confidence: {
      type: Number,
      default: null
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  reverseSearch: {
    performed: {
      type: Boolean,
      default: false
    },
    similarImages: [{
      title: String,
      link: String,
      source: String,
      thumbnail: String
    }],
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  overallResult: {
    type: String,
    enum: ['clean', 'suspicious', 'ai-generated', 'manipulated', 'unknown'],
    default: 'unknown'
  },
  summary: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);
