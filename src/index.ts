import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";
import { handlerMetrics} from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerValidate } from "./api/validate.js";
const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("src/app"))

app.use("/admin/healthz", handlerReadiness);
app.use("/admin/metrics",handlerMetrics);
app.post("/admin/reset", handlerReset);

app.post("/api/validate_chirp", handlerValidate);

app.use(middlewareLogResponses);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
})

