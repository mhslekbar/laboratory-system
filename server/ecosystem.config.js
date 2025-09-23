module.exports = {
  apps: [
    {
      name: "lab-system",      // ← ton label perso
      script: "./dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3050"
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true
    }
  ]
};
