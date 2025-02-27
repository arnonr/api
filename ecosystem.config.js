module.exports = {
    apps: [
        {
            name: "app",
            script: "index.js",
            instances: 24,
            exec_mode: "cluster",
            autorestart: true,
            restart_delay: 1000,
            max_restarts: 9999,
            watch: false,
            wait_ready: true,
            max_memory_restart: "2G",
            node_args: "--optimize_for_size --max-old-space-size=20480",
            load_balancing: {
                enabled: true,
                strategy: "least_conn",
                stable: true,
                sticky: true,
                relax_check: false,
            },
            log_date_format: "YYYY-MM-DD HH:mm Z",
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            merge_logs: true,
        },
    ],
};
