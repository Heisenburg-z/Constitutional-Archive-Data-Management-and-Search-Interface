const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['directory', 'file'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Archive' },
  metadata: {
    region: String,
    countryCode: String,
    language: String,
    keywords: [String],
    title: String,
    author: String,
    publicationDate: Date,
    documentType: String
  },
  contentUrl: String,
  contentText: String,
  fileSize: Number,
  fileType: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  accessLevel: { type: String, enum: ['public', 'private'], default: 'public' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Archive' }]
});

module.exports = mongoose.model('Archive', archiveSchema);