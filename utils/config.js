const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "ayarlar.json");

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

let cached = loadConfig();

function getConfig() {
  return cached;
}

function reloadConfig() {
  cached = loadConfig();
  return cached;
}

module.exports = { getConfig, reloadConfig };
