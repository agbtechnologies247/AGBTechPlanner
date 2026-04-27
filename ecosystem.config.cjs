module.exports = {
  apps: [
    {
      name: 'agbtech-planner-server',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_PATH: './db_prod'
      }
    }
  ]
};
