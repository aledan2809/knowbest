module.exports = {
  apps: [{
    name: 'knowbest',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/knowbest',
    env: {
      NODE_ENV: 'production',
      PORT: 3010
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
