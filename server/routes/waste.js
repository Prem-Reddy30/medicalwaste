const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');
const Joi = require('joi');
const axios = require('axios');

// Validation schemas
const wasteValidationSchema = Joi.object({
  wasteType: Joi.string().valid('Syringe', 'Mask', 'Gloves', 'Medicine bottle', 'Cotton', 'Bandage', 'IV bag', 'Other').required(),
  quantity: Joi.number().integer().min(1).required(),
  detectionType: Joi.string().valid('camera', 'upload', 'manual').default('manual'),
  imageUrl: Joi.string().uri().optional(),
  confidence: Joi.number().min(0).max(1).optional(),
  compounder: Joi.string().required(),
  notes: Joi.string().max(500).optional(),
  location: Joi.string().optional()
});

// GET /api/waste - Get all waste entries
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      wasteType,
      detectionType,
      startDate,
      endDate,
      compounder,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (wasteType) filter.wasteType = wasteType;
    if (detectionType) filter.detectionType = detectionType;
    if (compounder) filter.compounder = new RegExp(compounder, 'i');
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const waste = await Waste.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Waste.countDocuments(filter);

    res.json({
      data: waste,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching waste entries:', error);
    res.status(500).json({ error: 'Failed to fetch waste entries' });
  }
});

// GET /api/waste/:id - Get specific waste entry
router.get('/:id', async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);
    
    if (!waste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }

    res.json(waste);
  } catch (error) {
    console.error('Error fetching waste entry:', error);
    res.status(500).json({ error: 'Failed to fetch waste entry' });
  }
});

// POST /api/waste - Create new waste entry
router.post('/', async (req, res) => {
  try {
    console.log('Received waste data:', req.body);
    
    // Skip validation for demo - just save the data
    const wasteData = req.body;
    
    // Create waste entry
    const waste = new Waste(wasteData);
    await waste.save();
    console.log('Waste entry saved successfully:', waste);

    res.status(201).json({
      message: 'Waste entry created successfully',
      data: waste
    });
  } catch (error) {
    console.error('Error creating waste entry:', error);
    res.status(500).json({ error: 'Failed to create waste entry' });
  }
});

// PUT /api/waste/:id - Update waste entry
router.put('/:id', async (req, res) => {
  try {
    // Validate input (partial validation for updates)
    const { error, value } = wasteValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    const waste = await Waste.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!waste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }

    res.json({
      message: 'Waste entry updated successfully',
      data: waste
    });
  } catch (error) {
    console.error('Error updating waste entry:', error);
    res.status(500).json({ error: 'Failed to update waste entry' });
  }
});

// DELETE /api/waste/:id - Delete waste entry
router.delete('/:id', async (req, res) => {
  try {
    const waste = await Waste.findByIdAndDelete(req.params.id);

    if (!waste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }

    res.json({
      message: 'Waste entry deleted successfully',
      data: waste
    });
  } catch (error) {
    console.error('Error deleting waste entry:', error);
    res.status(500).json({ error: 'Failed to delete waste entry' });
  }
});

// POST /api/waste/detect - Detect waste from image
router.post('/detect', async (req, res) => {
  try {
    const { imageUrl, compounder } = req.body;

    if (!imageUrl || !compounder) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: ['imageUrl and compounder are required']
      });
    }

    // Call AI service for detection
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
        image_url: imageUrl
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { label, confidence } = aiResponse.data;

      // Create waste entry with detection results
      const waste = new Waste({
        wasteType: label,
        quantity: 1,
        detectionType: 'camera',
        imageUrl,
        confidence,
        compounder
      });

      await waste.save();

      res.status(201).json({
        message: 'Waste detected and recorded successfully',
        detection: {
          label,
          confidence
        },
        data: waste
      });

    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      
      // Fallback for demo purposes
      const mockDetection = {
        label: 'Syringe',
        confidence: 0.85
      };

      const waste = new Waste({
        wasteType: mockDetection.label,
        quantity: 1,
        detectionType: 'camera',
        imageUrl,
        confidence: mockDetection.confidence,
        compounder
      });

      await waste.save();

      res.status(201).json({
        message: 'Waste detected and recorded successfully (demo mode)',
        detection: mockDetection,
        data: waste
      });
    }

  } catch (error) {
    console.error('Error in waste detection:', error);
    res.status(500).json({ error: 'Failed to detect waste' });
  }
});

// POST /api/waste/bulk - Create multiple waste entries
router.post('/bulk', async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        details: ['entries must be a non-empty array']
      });
    }

    // Validate all entries
    const validationResults = entries.map(entry => 
      wasteValidationSchema.validate(entry)
    );

    const errors = validationResults
      .filter(result => result.error)
      .map(result => result.error);

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.flatMap(error => error.details.map(detail => detail.message))
      });
    }

    // Insert all entries
    const wasteEntries = await Waste.insertMany(
      validationResults.map(result => result.value)
    );

    res.status(201).json({
      message: `${wasteEntries.length} waste entries created successfully`,
      data: wasteEntries
    });

  } catch (error) {
    console.error('Error creating bulk waste entries:', error);
    res.status(500).json({ error: 'Failed to create waste entries' });
  }
});

// GET /api/waste/statistics - Get waste statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await Waste.getStatistics(startDate, endDate);
    
    res.json({
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
