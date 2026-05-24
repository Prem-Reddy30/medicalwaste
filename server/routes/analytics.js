const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get basic statistics
    const stats = await Waste.getStatistics(startDate, endDate);
    
    // Get daily data for the last 7 days
    const dailyData = await Waste.getDailyData(7);
    
    // Get waste distribution by type
    const distribution = await Waste.getDistributionByType();
    
    // Get monthly trends (last 6 months)
    const monthlyTrends = await Waste.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          },
          totalWaste: { $sum: '$quantity' },
          aiDetections: {
            $sum: {
              $cond: [
                { $in: ['$detectionType', ['camera', 'upload']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                months: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
              },
              in: { $arrayElemAt: ['$$months', { $subtract: ['$_id.month', 1] }] }
            }
          },
          waste: '$totalWaste',
          detections: '$aiDetections',
          _id: 0
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Get top compounders
    const topCompounders = await Waste.aggregate([
      {
        $group: {
          _id: '$compounder',
          totalEntries: { $sum: 1 },
          totalWaste: { $sum: '$quantity' },
          lastActive: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          name: '$_id',
          totalEntries: 1,
          totalWaste: 1,
          lastActive: 1,
          _id: 0
        }
      },
      {
        $sort: { totalEntries: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get detection efficiency
    const detectionStats = await Waste.aggregate([
      {
        $group: {
          _id: '$detectionType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          totalQuantity: 1,
          avgConfidence: { $round: ['$avgConfidence', 3] },
          _id: 0
        }
      }
    ]);

    res.json({
      message: 'Dashboard analytics retrieved successfully',
      data: {
        overview: stats,
        dailyData,
        distribution,
        monthlyTrends,
        topCompounders,
        detectionStats
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/waste-trends - Get waste trends
router.get('/waste-trends', async (req, res) => {
  try {
    const { period = 'weekly', startDate, endDate } = req.query;
    
    let groupFormat;
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = '%Y-%U';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const trends = await Waste.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$timestamp'
            }
          },
          totalWaste: { $sum: '$quantity' },
          entries: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $project: {
          period: '$_id',
          totalWaste: 1,
          entries: 1,
          avgConfidence: { $round: ['$avgConfidence', 3] },
          _id: 0
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);

    res.json({
      message: 'Waste trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    console.error('Error fetching waste trends:', error);
    res.status(500).json({ error: 'Failed to fetch waste trends' });
  }
});

// GET /api/analytics/waste-types - Get detailed waste type analytics
router.get('/waste-types', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const wasteTypeAnalytics = await Waste.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$wasteType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          detectionMethods: {
            $push: '$detectionType'
          }
        }
      },
      {
        $addFields: {
          cameraCount: {
            $size: {
              $filter: {
                input: '$detectionMethods',
                cond: { $eq: ['$$this', 'camera'] }
              }
            }
          },
          uploadCount: {
            $size: {
              $filter: {
                input: '$detectionMethods',
                cond: { $eq: ['$$this', 'upload'] }
              }
            }
          },
          manualCount: {
            $size: {
              $filter: {
                input: '$detectionMethods',
                cond: { $eq: ['$$this', 'manual'] }
              }
            }
          }
        }
      },
      {
        $project: {
          wasteType: '$_id',
          totalQuantity: 1,
          count: 1,
          avgConfidence: { $round: ['$avgConfidence', 3] },
          detectionBreakdown: {
            camera: '$cameraCount',
            upload: '$uploadCount',
            manual: '$manualCount'
          },
          _id: 0
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);

    res.json({
      message: 'Waste type analytics retrieved successfully',
      data: wasteTypeAnalytics
    });

  } catch (error) {
    console.error('Error fetching waste type analytics:', error);
    res.status(500).json({ error: 'Failed to fetch waste type analytics' });
  }
});

// GET /api/analytics/performance - Get system performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { period = '30' } = req.query; // default last 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // AI detection performance
    const aiPerformance = await Waste.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          detectionType: { $in: ['camera', 'upload'] },
          confidence: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' },
          minConfidence: { $min: '$confidence' },
          maxConfidence: { $max: '$confidence' },
          totalDetections: { $sum: 1 }
        }
      },
      {
        $project: {
          avgConfidence: { $round: ['$avgConfidence', 3] },
          minConfidence: { $round: ['$minConfidence', 3] },
          maxConfidence: { $round: ['$maxConfidence', 3] },
          totalDetections: 1,
          _id: 0
        }
      }
    ]);

    // Processing efficiency
    const processingStats = await Waste.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          processedEntries: {
            $sum: { $cond: ['$processed', 1, 0] }
          },
          avgProcessingTime: {
            $avg: {
              $cond: [
                { $and: ['$processed', '$processedAt'] },
                { $subtract: ['$processedAt', '$timestamp'] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          totalEntries: 1,
          processedEntries: 1,
          processingRate: {
            $round: [
              { $multiply: [{ $divide: ['$processedEntries', '$totalEntries'] }, 100] },
              2
            ]
          },
          avgProcessingTime: { $round: ['$avgProcessingTime', 0] },
          _id: 0
        }
      }
    ]);

    // Activity patterns
    const activityPatterns = await Waste.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            dayOfWeek: { $dayOfWeek: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          totalEntries: { $sum: '$count' },
          avgEntries: { $avg: '$count' }
        }
      },
      {
        $project: {
          hour: '$_id',
          totalEntries: 1,
          avgEntries: { $round: ['$avgEntries', 2] },
          _id: 0
        }
      },
      {
        $sort: { hour: 1 }
      }
    ]);

    res.json({
      message: 'Performance metrics retrieved successfully',
      data: {
        aiPerformance: aiPerformance[0] || {},
        processingStats: processingStats[0] || {},
        activityPatterns
      }
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

module.exports = router;
