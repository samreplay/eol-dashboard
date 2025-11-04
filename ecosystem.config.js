module.exports = {
  apps: [
    {
      name: 'eol-dashboard',
      script: './.output/server/index.mjs',
      cwd: '/var/www/eol-dashboard',  // Update this path to match your VPS location
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
