import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,} from "typeorm";
import { Article } from "./Article";
import { FactureAchat } from "./FactureAchat";

@Entity("stocks")
export class Stock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  articles_id!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  entree!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  sortie!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    generatedType: "STORED",
    asExpression: "entree - sortie",
  })
  total!: number;

  @Column({
    type: "boolean",
    generatedType: "STORED",
    asExpression:
      "(SELECT SUM(s.entree) - SUM(s.sortie) <= 2 FROM stocks s WHERE s.articles_id = articles_id)",
  })
  is_low_stock!: boolean;

  @Column({ type: "timestamp", nullable: true })
  date_entree!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  date_sortie!: Date | null;

  @ManyToOne(() => Article, (article) => article.stocks)
  @JoinColumn({ name: "articles_id" })
  article!: Article;

  @ManyToOne(() => FactureAchat, factureAchat => factureAchat.stocks, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "facture_achat_id" })
  factureAchat!: FactureAchat;
}