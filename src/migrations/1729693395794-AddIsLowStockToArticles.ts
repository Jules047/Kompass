import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsLowStockToArticles1710744000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne is_low_stock
    await queryRunner.addColumn(
      "articles",
      new TableColumn({
        name: "is_low_stock",
        type: "boolean",
        default: false,
        isNullable: false,
      })
    );

    // Créer la fonction du trigger
    await queryRunner.query(`
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

    // Créer le trigger
    await queryRunner.query(`
            CREATE TRIGGER stock_alert_trigger
            AFTER INSERT OR UPDATE ON stocks
            FOR EACH ROW
            EXECUTE FUNCTION check_low_stock();
        `);

    // Initialiser la valeur de is_low_stock pour les articles existants
    await queryRunner.query(`
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer le trigger
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS stock_alert_trigger ON stocks;
        `);

    // Supprimer la fonction
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS check_low_stock();
        `);

    // Supprimer la colonne
    await queryRunner.dropColumn("articles", "is_low_stock");
  }
}
