"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
exports.default = {
    jwtSecret: "kompass-v2-secret-key",
    jwtExpiration: "24h",
    database: data_source_1.AppDataSource,
    server: {
        port: 3000,
    },
};
//# sourceMappingURL=config.js.map