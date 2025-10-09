// src/config/corsOptions.ts
import cors, { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3061",
  "http://127.0.0.1:3061",
  "https://medepratlab.com",
  "https://www.medepratlab.com",
];

export const corsOptions: CorsOptions = {
  origin(origin, cb) {
    console.log("allowedOrigins", allowedOrigins); 
    console.log("CORS origin:", origin);  
    console.log("check: ", allowedOrigins.includes(origin ?? ""));
    // Autoriser requêtes server-to-server et outils (sans header Origin)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true, // cookies / Authorization cross-site si besoin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 204,
};

export const corsPreflight = cors(corsOptions);

// export const corsPreflight = (req: any, res: any) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
// }
