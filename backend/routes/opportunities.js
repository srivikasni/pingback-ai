const router = require('express').Router();
const Opportunity = require('../models/Opportunity');

// CREATE - POST /api/opportunities
router.post('/', async (req, res) => {
  try {
    const opportunity = new Opportunity(req.body);
    const saved = await opportunity.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL - GET /api/opportunities (supports ?category=&status=&search=)
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const opportunities = await Opportunity.find(filter).sort({ deadline: 1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE - GET /api/opportunities/:id
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - PUT /api/opportunities/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - DELETE /api/opportunities/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Opportunity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STATS - GET /api/opportunities/meta/stats (for dashboard cards + charts)
router.get('/meta/stats', async (req, res) => {
  try {
    const all = await Opportunity.find();
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    const stats = {
      total: all.length,
      dueThisWeek: all.filter(o => o.deadline && o.deadline <= weekFromNow && o.deadline >= now).length,
      completed: all.filter(o => o.status === 'Completed').length,
      pending: all.filter(o => !['Completed', 'Missed', 'Archived'].includes(o.status)).length,
      byCategory: {},
      byStatus: {}
    };

    all.forEach(o => {
      stats.byCategory[o.category] = (stats.byCategory[o.category] || 0) + 1;
      stats.byStatus[o.status] = (stats.byStatus[o.status] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
