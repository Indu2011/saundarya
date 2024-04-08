const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const authRouter = require("./routes/authRoutes");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many accounts created from this IP, please try again after a minute",
});

const app = express();

// Middlewares
app.use("/api", limiter);

app.use(express.json());
app.use(morgan("common"));
app.use(helmet());
app.use(cors());
app.use(limiter); //  apply to all requests

app.use(mongoSanitize());
app.use(xss());

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello Stranger! How are you?",
  });
});

app.use("/api/v1/auth", authRouter);

app.all("*", (req, res, next) => {
  next(new AppError("Can't find the page on server."));
});

app.use(globalErrorHandler);

module.exports = app;
