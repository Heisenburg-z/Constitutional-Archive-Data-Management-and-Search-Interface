module.exports = {
  apps: [{
    name: "Constitutional-Archive-Data-Management-API",
    script: "./index.js",
    instances: 1, // Run only 1 instance
    exec_mode: "fork", // Use fork mode
    env: {
      NODE_ENV: "production",
    }
  }]
};