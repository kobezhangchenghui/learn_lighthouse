const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

router.get('/', websiteController.getAllWebsites);
router.get('/:id', websiteController.getWebsiteById);
router.post('/', websiteController.createWebsite);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);
router.post('/run-tests', websiteController.runPerformanceTests);
router.post('/run-test/:id', websiteController.runSingleTest);

module.exports = router;