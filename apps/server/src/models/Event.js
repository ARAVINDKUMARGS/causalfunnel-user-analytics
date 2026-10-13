const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema(
  {
    clientX: { type: Number, default: 0 },
    clientY: { type: Number, default: 0 },
    pageX: { type: Number, default: 0 },
    pageY: { type: Number, default: 0 },
    scrollX: { type: Number, default: 0 },
    scrollY: { type: Number, default: 0 },
    viewportWidth: { type: Number, default: 0 },
    viewportHeight: { type: Number, default: 0 },
    pageWidth: { type: Number, default: 0 },
    pageHeight: { type: Number, default: 0 },
    targetTag: { type: String, maxlength: 30, trim: true },
    targetId: { type: String, maxlength: 60, trim: true },
    targetClass: { type: String, maxlength: 120, trim: true },
    targetText: { type: String, maxlength: 120, trim: true }
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      index: true,
      trim: true,
      maxlength: 128
    },
    website_id: {
      type: String,
      required: [true, 'website_id is required'],
      index: true,
      trim: true,
      maxlength: 64
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: 'event_type must be either page_view or click'
      }
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
      maxlength: 2048
    },
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required'],
      default: Date.now
    },
    click: {
      type: ClickSchema,
      required: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // Guard against arbitrary large objects or nested query injection
          const str = JSON.stringify(v);
          return str.length <= 4096;
        },
        message: 'metadata payload exceeds maximum allowed size of 4KB'
      }
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        if (ret.timestamp instanceof Date) {
          ret.timestamp = ret.timestamp.toISOString();
        }
        return ret;
      }
    }
  }
);

// Compound indexes for optimal aggregation performance
EventSchema.index({ website_id: 1, session_id: 1, timestamp: -1 });
EventSchema.index({ website_id: 1, page_url: 1, event_type: 1, timestamp: -1 });
EventSchema.index({ website_id: 1, timestamp: -1 });

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
