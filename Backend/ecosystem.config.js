module.exports = {
  apps: [{
    name: "constitutional-archive-api",
    script: "./index.js",
    instances: 1, // Run only 1 instance
    exec_mode: "fork", // Use fork mode
    env: {
      NODE_ENV: "production",
    }
  }]
};