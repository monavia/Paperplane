const TikTokService = require("../../services/TikTokService");
const Logger = require("../utils/Logger");

function load(client) {
  try {
    TikTokService.init(client);
    Logger.ready("TikTok notification service started");
    return true;
  } catch (err) {
    Logger.warn("TikTok service not available:", err.message);
    return false;
  }
}

module.exports = { load };
