const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

const SERVER_HOST = 'CoolBoyOP099.aternos.me';
const SERVER_PORT = 26004;
let currentBotIndex = 3;
let bot = null;

function createBot() {
  const username = `SON${currentBotIndex}`;
  console.log(`🟢 Trying bot: ${username}`);

  bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: username,
    version: '1.21.1'
  });

  bot.on('spawn', () => {
    console.log(`✅ Bot ${username} spawned.`);

    // Movement: Sneak, Jump, Walk
    setInterval(() => {
      if (!bot || !bot.entity) return;
      const actions = ['sneak', 'jump', 'walk'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      if (action === 'sneak') {
        bot.setControlState('sneak', true);
        setTimeout(() => bot.setControlState('sneak', false), 2000);
      } else if (action === 'jump') {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      } else if (action === 'walk') {
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 3000);
      }
    }, 10000);
  });

  bot.on('kicked', (reason) => {
    console.log(`❌ Bot ${username} was kicked or banned:`, reason);
    nextBot(); // Move to next bot
  });

  bot.on('end', () => {
    console.log(`❌ Bot ${username} disconnected.`);
  });

  bot.on('error', (err) => {
    console.log(`❌ Bot Error: ${err}`);
    if (err.message.includes("banned") || err.message.includes("You are banned")) {
      nextBot(); // If banned, switch
    }
  });
}

function nextBot() {
  if (bot) {
    bot.quit();
    bot = null;
  }
  currentBotIndex++;
  if (currentBotIndex > 20) currentBotIndex = 3;
  setTimeout(() => {
    createBot();
  }, 5000); // Wait 5s before creating new bot
}

// Check every 2 min if server online
setInterval(async () => {
  try {
    const res = await axios.get(`https://api.mcstatus.io/v2/status/java/${SERVER_HOST}:${SERVER_PORT}`);
    if (res.data.online) {
      console.log("✅ Server online, checking bot...");
      if (!bot || !bot.player) {
        createBot();
      }
    } else {
      console.log("❌ Server offline.");
    }
  } catch (e) {
    console.log("🌐 Error checking server:", e.message);
  }
}, 2 * 60 * 1000);

// Auto change bot every 4 hours
setInterval(() => {
  console.log("🔁 4 hour bot switch");
  nextBot();
}, 4 * 60 * 60 * 1000);

// Web server for uptime
const app = express();
app.get('/', (req, res) => res.send('Bot is alive'));
app.listen(3000, () => console.log("🌍 Web server running on port 3000"));
