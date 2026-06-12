const { getMarketStatus } = require("../services/marketSimulation");

const getStatus = async (req, res) => {
  try {
    const status = await getMarketStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatus
};
