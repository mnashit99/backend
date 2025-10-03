import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedProfile1759147560527 implements MigrationInterface {
    name = 'UpdatedProfile1759147560527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileProfile_full_name"`);
        await queryRunner.query(`CREATE TYPE "public"."order_paymentmethod_enum" AS ENUM('STRIPE', 'CASH_ON_DELIVERY')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentMethod" "public"."order_paymentmethod_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paymentIntentId" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_b8152b3ce5dbe0da0a73d88df0" ON "order" ("paymentIntentId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b8152b3ce5dbe0da0a73d88df0"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentIntentId"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."order_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profileProfile_full_name" character varying(150)`);
    }

}
