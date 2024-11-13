import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Commande } from "./Commande";
import { Article } from "./Article";

@Entity("commande_article")
export class CommandeArticle {
  push(commandeArticle: CommandeArticle) {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantite!: number;

  @ManyToOne(() => Commande, (commande) => commande.commandeArticles, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "commande_id" })
  commande!: Commande;

  @ManyToOne(() => Article, { eager: true })
  @JoinColumn({ name: "article_id" })
  article!: Article;
}