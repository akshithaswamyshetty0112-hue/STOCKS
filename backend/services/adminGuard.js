const User = require("../models/User");
const { createAuditLog } = require("./auditService");

const enforceSingleAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set. No admin account will be promoted automatically.");
    return;
  }

  const demoteResult = await User.updateMany(
    { role: "admin", email: { $ne: adminEmail } },
    { $set: { role: "user" } }
  );

  const promoteResult = await User.updateOne(
    { email: adminEmail },
    { $set: { role: "admin" } }
  );

  if (demoteResult.modifiedCount > 0 || promoteResult.modifiedCount > 0) {
    await createAuditLog({
      action: "SINGLE_ADMIN_ENFORCED",
      entity: "USER",
      details: {
        adminEmail,
        demotedAdmins: demoteResult.modifiedCount,
        promotedAdminMatched: promoteResult.matchedCount
      }
    });
  }
};

module.exports = {
  enforceSingleAdmin
};
