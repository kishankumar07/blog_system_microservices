import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from './routes/commentRoutes.js'

dotenv.config(); // Load environment variables

const app = express();

// Swagger Setup 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Load Post Routes
app.use("/posts", postRoutes);
app.use('/comments',commentRoutes)

const PORT = process.env.GATEWAY_PORT || 3000;

// Start the API Gateway server
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
 