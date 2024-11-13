import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Devis } from "./Devis";
import { Article } from "./Article";

@Entity("devis_article")
export class DevisArticle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantite!: number;

  @ManyToOne(() => Devis, (devis) => devis.devisArticles)
  @JoinColumn({ name: "devis_id" })
  devis!: Devis;

  @ManyToOne(() => Article, { eager: true })
  @JoinColumn({ name: "article_id" })
  article!: Article;
}
