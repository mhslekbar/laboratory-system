module.exports = {
  apps: [
    {
      name: "lab-sys",
      script: "./dist/src/server.js",
      // Valeurs par défaut quand tu lances sans --env
      env: {
        NODE_ENV: "development",
        PORT: "3062",
        MONGO_URI: "mongodb://127.0.0.1:27017/lab_system",
        CORS_ORIGIN: "http://localhost:3061,http://127.0.0.1:3061",
        JWT_SEC: "27eb244ea5e4ce3d15804c58cb065169025c23795ef5fdb2ea656e6109e1b02ef33d8e8818722d5f2e8da1ccf145f1bd845557d3f876c4084ed1cab1eff3b0db",
        JWT_REFRESH_SEC: "27eb244ea5e4ce3d15804c58cb065169025c23795ef5fdb2ea656e6109e1b02ef33d8e8818722d5f2e8da1ccf145f1bd845557d3f876c4084ed1cab",
        JWT_EXPIRES: "15m",
        JWT_REFRESH_EXPIRES: "30d",
        ROOT_DIR:"C:/Users/INFOTELEC/Desktop/mern-projects/laboratory-system/server",
        PUBLIC_DIR:"C:/Users/INFOTELEC/Desktop/mern-projects/laboratory-system/server/public",
        UPLOADS_DIR:"C:/Users/INFOTELEC/Desktop/mern-projects/laboratory-system/server/public/uploads",
      },
      // Utilisé quand tu fais: pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: "production",
        PORT: "3062",
        MONGO_URI:
          "mongodb+srv://sniper:1212@cluster0.p4xc21i.mongodb.net/lab_system?retryWrites=true&w=majority",
        CORS_ORIGIN: "https://medepratlab.com,https://www.medepratlab.com",
        JWT_SEC: "27eb244ea5e4ce3d15804c58cb065169025c23795ef5fdb2ea656e6109e1b02ef33d8e8818722d5f2e8da1ccf145f1bd845557d3f876c4084ed1cab1eff3b0db",
        JWT_REFRESH_SEC: "27eb244ea5e4ce3d15804c58cb065169025c23795ef5fdb2ea656e6109e1b02ef33d8e8818722d5f2e8da1ccf145f1bd845557d3f876c4084ed1cab",
        JWT_EXPIRES: "15m",
        JWT_REFRESH_EXPIRES: "30d",
        ROOT_DIR: "/root/laboratory-system/server",
        PUBLIC_DIR: "/root/laboratory-system/server/public",
        UPLOADS_DIR: "/root/laboratory-system/server/public/uploads",
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
