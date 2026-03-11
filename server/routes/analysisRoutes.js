const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const analysisController = require('../controllers/analysisController');

router.post('/analyze', upload.single('image'), analysisController.uploadAndAnalyze);

router.get('/history', analysisController.getAnalysisHistory);

router.get('/:id', analysisController.getAnalysisById);

router.delete('/:id', analysisController.deleteAnalysis);

router.get('/stats/summary', analysisController.getStats);

module.exports = router;
