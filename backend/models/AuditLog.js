const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    actorEmail: {
      type: String,
      default: "system"
    },
    actorRole: {
      type: String,
      default: "system"
    },
    action: {
      type: String,
      required: true
    },
    entity: {
      type: String,
      required: true
    },
    details: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
