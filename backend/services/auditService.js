const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({ actor, action, entity, details = {} }) => {
  try {
    await AuditLog.create({
      actorId: actor?._id || actor?.id || null,
      actorEmail: actor?.email || "system",
      actorRole: actor?.role || "system",
      action,
      entity,
      details
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

module.exports = {
  createAuditLog
};
