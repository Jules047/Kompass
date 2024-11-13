import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FactureAchat } from "./FactureAchat";
import { Fournisseur } from "./Fournisseur";
import { Article } from "./Article";

@Entity("historique_facturation_achat")
export class HistoriqueFacturationAchat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  factures_achat_id!: number;

  @Column()
  fournisseurs_id!: number;

  @Column()
  article_id!: number;

  @Column("date")
  date!: Date;

  @ManyToOne(() => FactureAchat)
  @JoinColumn({ name: "factures_achat_id" })
  factureAchat!: FactureAchat;

  @ManyToOne(() => Fournisseur)
  @JoinColumn({ name: "fournisseurs_id" })
  fournisseur!: Fournisseur;

  @ManyToOne(() => Article)
  @JoinColumn({ name: "article_id" })
  article!: Article;
}
