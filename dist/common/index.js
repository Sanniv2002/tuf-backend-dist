"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    username: zod_1.z.string(),
    language: zod_1.z.string(),
    stdin: zod_1.z.string(),
    src: zod_1.z.string()
});
exports.Schema = Schema;
