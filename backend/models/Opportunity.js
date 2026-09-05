const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Internship',
        'Workshop',
        'Hackathon',
        'Scholarship',
        'Assignment',
        'Event',
        'Competition',
        'Other'
      ],
      default: 'Other'
    },
    sourcePlatform: {
      type: String,
      enum: ['WhatsApp', 'LinkedIn', 'Instagram', 'Email', 'Telegram', 'Poster', 'Other'],
      default: 'Other'
    },
    applicationLink: {
      type: String,
      default: ''
    },
    deadline: {
      type: Date
    },
    reminderDate: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    nextAction: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Saved', 'In Progress', 'Applied/Registered', 'Completed', 'Missed', 'Archived'],
      default: 'Saved'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
