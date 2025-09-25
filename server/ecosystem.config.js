module.exports = {
  apps: [
    {
      name: "lab-system",
      script: "./dist/server.js",
      // Valeurs par défaut quand tu lances sans --env
      env: {
        NODE_ENV: "development",
        PORT: "3052",
      },
      // Utilisé quand tu fais: pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: "production",
        PORT: "3050",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true,
    },
  ],
};

// // server/ecosystem.config.js

// module.exports = {
//   apps: [
//     {
//       name: "lab-system",      // ← ton label perso
//       script: "./dist/server.js",
//       env: {
//         NODE_ENV: "production",
//         PORT: "3050"
//       },
//       autorestart: true,
//       watch: false,
//       max_memory_restart: "300M",
//       out_file: "./logs/out.log",
//       error_file: "./logs/error.log",
//       time: true
//     }
//   ]
// };
