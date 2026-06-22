"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useStaticAssets(process.env.STORAGE_DIR || (0, path_1.join)(process.cwd(), 'storage'), {
        prefix: '/storage/',
    });
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
    console.log(`SFXSAI API listening on ${await app.getUrl()}`);
    const keepAlive = setInterval(() => undefined, 60_000);
    const shutdown = async () => {
        clearInterval(keepAlive);
        await app.close();
        process.exit(0);
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}
void bootstrap();
//# sourceMappingURL=main.js.map