import { defineApp } from "convex/server";
import nanoBanana from "convex-nano-banana/convex.config";

const app = defineApp();
app.use(nanoBanana);

export default app;