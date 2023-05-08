import dotenv from "dotenv";
import server from "./server";

dotenv.config();

main().then(() => console.log(`API is listening on port ${process.env.PORT}`));

async function main() {
  const app = await server(process.env.MONGODB_URL);
  app.listen(process.env.PORT);
}
