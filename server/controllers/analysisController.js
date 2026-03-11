const Analysis = require('../models/Analysis');
const sightengineService = require('../services/sightengine');
const serpapiService = require('../services/serpapi');
const path = require('path');

const determineOverallResult = (aiDetection, manipulationDetection) => {
  if (aiDetection?.isAIGenerated === true) {
    return 'ai-generated';
  }
  if (manipulationDetection?.isManipulated === true) {
    return 'manipulated';
  }
  if (aiDetection?.isAIGenerated === false && manipulationDetection?.isManipulated === false) {
    return 'clean';
  }
  return 'unknown';
};

const generateSummary = (aiDetection, manipulationDetection) => {
  const parts = [];
  
  if (aiDetection?.isAIGenerated === true) {
    parts.push(`AI-generated content detected with ${aiDetection.confidence}% confidence`);
  } else if (aiDetection?.isAIGenerated === false) {
    parts.push('No AI generation detected');
  }
  
  if (manipulationDetection?.isManipulated === true) {
    parts.push(`${manipulationDetection.type} content detected with ${manipulationDetection.confidence}% confidence`);
  } else if (manipulationDetection?.isManipulated === false) {
    parts.push('No manipulation detected');
  }
  
  return parts.join('. ') || 'Analysis completed with uncertain results';
};

exports.uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageName = req.file.originalname;

    const [sightengineResult, serpapiResult] = await Promise.all([
      sightengineService.analyzeWithFallback(imagePath),
      serpapiService.searchWithFallback(imagePath)
    ]);

    const aiDetection = sightengineResult.aiDetection;
    const manipulationDetection = sightengineResult.manipulationDetection;
    const similarImages = serpapiResult.similarImages;

    const overallResult = determineOverallResult(aiDetection, manipulationDetection);
    const summary = generateSummary(aiDetection, manipulationDetection);

    const analysis = new Analysis({
      imageName,
      imagePath: `/uploads/${req.file.filename}`,
      aiDetection,
      manipulationDetection,
      reverseSearch: {
        performed: true,
        similarImages,
        rawData: serpapiResult.data
      },
      overallResult,
      summary
    });

    await analysis.save();

    res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze image'
    });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Analysis.countDocuments();

    res.json({
      success: true,
      data: analyses,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch history'
    });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analysis'
    });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete analysis'
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Analysis.countDocuments();
    const aiGenerated = await Analysis.countDocuments({ 'aiDetection.isAIGenerated': true });
    const manipulated = await Analysis.countDocuments({ 'manipulationDetection.isManipulated': true });
    const clean = await Analysis.countDocuments({ overallResult: 'clean' });

    res.json({
      success: true,
      data: {
        total,
        aiGenerated,
        manipulated,
        clean,
        unknown: total - aiGenerated - manipulated - clean
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stats'
    });
  }
};
