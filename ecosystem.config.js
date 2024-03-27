module.exports = {
  apps: [
    {
      name: "app",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      node_args: "--optimize_for_size --max-old-space-size=920",
      load_balancing: {
        enabled: true,
        strategy: "round-robin",
        sticky: true,
        relax_check: false,
      },
    },
  ],
};
