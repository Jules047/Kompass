import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PriseEnCharge } from "./PriseEnCharge";
import { Article } from "./Article";

@Entity("prise_en_charge_article")
export class PriseEnChargeArticle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantite!: number;

  @ManyToOne(
    () => PriseEnCharge,
    (priseEnCharge) => priseEnCharge.priseEnChargeArticles,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "prise_en_charge_id" })
  priseEnCharge!: PriseEnCharge;

  @Column()
  prise_en_charge_id!: number;

  @ManyToOne(() => Article, { eager: true })
  @JoinColumn({ name: "article_id" })
  article!: Article;

  @Column()
  article_id!: number;
}

