import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FactureArticle } from "./FactureArticle";
import { Article } from "./Article";

@Entity("facture_article_detail")
export class FactureArticleDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantite!: number;

  @ManyToOne(() => FactureArticle, (facture) => facture.factureArticleDetails)
  @JoinColumn({ name: "facture_article_id" })
  factureArticle!: FactureArticle;

  @ManyToOne(() => Article, { eager: true })
  @JoinColumn({ name: "article_id" })
  article!: Article;
}
