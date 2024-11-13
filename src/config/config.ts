import { AppDataSource } from "../data-source";

export default {
  jwtSecret: "kompass-v2-secret-key",
  jwtExpiration: "24h",

  database: AppDataSource,

  server: {
    port: 3000,
  },
};
