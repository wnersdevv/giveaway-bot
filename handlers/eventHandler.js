const fs = require("fs");
const path = require("path");

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "..", "events");

  for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }
}

module.exports = { loadEvents };
