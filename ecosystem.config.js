module.exports = {
  apps: [
    {
      name: "app",
      script: "app.js",
      instances: 32,
      exec_mode: "cluster",
      load_balancing: {
        enabled: true,
        strategy: "round-robin",
        sticky: true,
      },
    },
  ],
};
