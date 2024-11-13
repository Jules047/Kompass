import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FactureAchat } from "./FactureAchat";
import { Article } from "./Article";

@Entity("facture_achat_detail")
export class FactureAchatDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantite!: number;

  @ManyToOne(() => FactureAchat, (facture) => facture.factureAchatDetails, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "facture_achat_id" })
  factureAchat!: FactureAchat;

  @ManyToOne(() => Article, { eager: true })
  @JoinColumn({ name: "article_id" })
  article!: Article;
}
