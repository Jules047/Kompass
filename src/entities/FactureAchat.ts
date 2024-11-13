import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Fournisseur } from "./Fournisseur";
import { MoyenPaiement } from "./MoyenPaiement";
import { FactureAchatDetail } from "./FactureAchatDetail";
import { Article } from "./Article";
import { Stock } from "./Stock";

@Entity("factures_achat")
export class FactureAchat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Fournisseur)
  @JoinColumn({ name: "fournisseurs_id" })
  fournisseur!: Fournisseur;

  @Column()
  fournisseurs_id!: number;

  @Column({ nullable: true })
  article_id!: number;

  @Column()
  commentaire!: string;

  @Column("date")
  date!: Date;

  @Column("real")
  montant_regle!: number;

  @Column("real")
  solde_du!: number;

  @Column("real")
  prix_total!: number;

  @ManyToOne(() => MoyenPaiement)
  @JoinColumn({ name: "moyens_paiement_id" })
  moyenPaiement!: MoyenPaiement;

  @Column()
  moyens_paiement_id!: number;

  @OneToMany(() => FactureAchatDetail, (detail) => detail.factureAchat, {
    cascade: true,
    onDelete: "CASCADE",
  })
  factureAchatDetails!: FactureAchatDetail[];

  @ManyToOne(() => Article)
  @JoinColumn({ name: "article_id" })
  article!: Article;

  @OneToMany(() => Stock, (stock) => stock.factureAchat, {
    cascade: true,
    onDelete: "CASCADE",
  })
  stocks!: Stock[];
}
