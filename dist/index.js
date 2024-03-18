"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const common_1 = require("./common");
const Redis = require('ioredis');
//Declaring Global Useables
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const client = new client_1.PrismaClient();
const redisClient = new Redis();
//Function to fetch or get data from db or cache
const getData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cachedData = yield redisClient.get(key);
        if (cachedData) {
            console.log("Returned from cache");
            return JSON.parse(cachedData);
        }
        else {
            const newData = yield client.user.findUnique({
                where: {
                    username: key
                }
            });
            yield redisClient.set(key, JSON.stringify(newData));
            return newData;
        }
    }
    catch (e) {
        console.log("DB error/Internal server error");
    }
});
app.use((0, cors_1.default)()); //Middleware for Cross-Origin Resource Sharing Error
app.use(express_1.default.json()); //Middleware to parse JSON Body
app.get("/", (_, res) => {
    res.status(200).json({
        message: "Server is healthy"
    });
});
//Route to create a new code snippet
app.post("/api/v1/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const validateData = common_1.Schema.safeParse(data);
        if (!validateData.success)
            res.json({ message: "Wrong data was sent" });
        const isExisting = yield client.user.findUnique({
            where: {
                username: data.username
            }
        });
        if (isExisting) {
            res.status(403).json({
                message: "User already exists"
            });
        }
        const response = yield client.user.create({
            data: {
                username: data.username,
                language: data.language,
                stdin: data.stdin,
                src: Buffer.from(data.src, "utf-8")
            }
        });
        res.status(200).json(response);
    }
    catch (e) {
        res.status(500).json({
            error: `Internal server error ${e}`,
        });
    }
}));
//Route to get the code snippet and user details
app.get("/api/v1/code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.query.user || "";
    const response = yield getData(user);
    if (response) {
        const truncatedSrc = response.src.toString("utf8").substring(0, 100);
        response.src = truncatedSrc;
    }
    res.send(response);
}));
app.listen(PORT, () => {
    console.log("Server started at PORT:", PORT);
});
