module.exports = {
  apps: [
    {
      name: "app",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      node_args: "--optimize_for_size --max-old-space-size=2048",
      load_balancing: {
        enabled: true,
        strategy: "round-robin",
        stable: true,
        sticky: true,
        relax_check: false,
      },
    },
  ],
};
