module.exports = {
    apps: [{
      name: "constitutional-archive-api",
      script: "./index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production"
      }
    }]
  }