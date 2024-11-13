"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsLowStockToArticles1710744000000 = void 0;
const typeorm_1 = require("typeorm");
class AddIsLowStockToArticles1710744000000 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.addColumn("articles", new typeorm_1.TableColumn({
                name: "is_low_stock",
                type: "boolean",
                default: false,
                isNullable: false,
            }));
            yield queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_low_stock()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (
                    SELECT SUM(entree) - SUM(sortie)
                    FROM stocks
                    WHERE articles_id = NEW.articles_id
                ) <= 2 THEN
                    UPDATE articles 
                    SET is_low_stock = true 
                    WHERE id = NEW.articles_id;
                ELSE
                    UPDATE articles 
                    SET is_low_stock = false 
                    WHERE id = NEW.articles_id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
            yield queryRunner.query(`
            CREATE TRIGGER stock_alert_trigger
            AFTER INSERT OR UPDATE ON stocks
            FOR EACH ROW
            EXECUTE FUNCTION check_low_stock();
        `);
            yield queryRunner.query(`
            UPDATE articles a
            SET is_low_stock = (
                SELECT CASE 
                    WHEN SUM(s.entree) - SUM(s.sortie) <= 2 THEN true 
                    ELSE false 
                END
                FROM stocks s
                WHERE s.articles_id = a.id
                GROUP BY s.articles_id
            );
        `);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
            DROP TRIGGER IF EXISTS stock_alert_trigger ON stocks;
        `);
            yield queryRunner.query(`
            DROP FUNCTION IF EXISTS check_low_stock();
        `);
            yield queryRunner.dropColumn("articles", "is_low_stock");
        });
    }
}
exports.AddIsLowStockToArticles1710744000000 = AddIsLowStockToArticles1710744000000;
//# sourceMappingURL=1729693395794-AddIsLowStockToArticles.js.map