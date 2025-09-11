for generating migrations: npm run typeorm migration:generate src/migration/InitialSchema -- -d src/configs/datasource.ts
for running migrations: npm run typeorm migration:run -- -d src/configs/datasource.ts
for reverting migrations: npm run typeorm migration:revert -- -d src/configs/datasource.ts
