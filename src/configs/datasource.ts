  import { DataSource } from 'typeorm';
  import * as dotenv from 'dotenv';



  dotenv.config();



  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    migrations: [__dirname + '/../migration/*.{js,ts}'],
    synchronize: false,
  });

  export default dataSource;