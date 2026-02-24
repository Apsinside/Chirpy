import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { handlerMetrics} from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc, express.static("src/app"))
app.use("/api/healthz", handlerReadiness);
app.use("/api/metrics",handlerMetrics);
app.use("/api/reset", handlerReset);
app.use(middlewareLogResponses);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
})

