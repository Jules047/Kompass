// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
// import { Client } from "./Client";
// import { Article } from "./Article";
// import { MoyenPaiement } from "./MoyenPaiement";

// @Entity("factures_article")
// export class FactureArticle {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   clients_id!: number;

//   @Column()
//   moyens_paiement_id!: number;

//   @Column()
//   articles_id!: number;

//   @Column("text")
//   commentaire!: string;

//   @Column("real")
//   montant_initial!: number;

//   @Column("real")
//   montant_regle!: number;

//   @Column("real")
//   solde_du!: number;

//   @Column("date")
//   date!: Date;

//   @Column({
//     type: "enum",
//     enum: ["Approuvée", "En cours", "Payée"],
//   })
//   statut!: string;

//   @ManyToOne(() => Client)
//   @JoinColumn({ name: "clients_id" })
//   client!: Client;

//   @ManyToOne(() => Article)
//   @JoinColumn({ name: "articles_id" })
//   article!: Article;

//   @ManyToOne(() => MoyenPaiement)
//   @JoinColumn({ name: "moyens_paiement_id" })
//   moyenPaiement!: MoyenPaiement;
// }

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Client } from "./Client";
import { MoyenPaiement } from "./MoyenPaiement";
import { FactureArticleDetail } from "./FactureArticleDetail";

@Entity("factures_article")
export class FactureArticle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column()
  moyens_paiement_id!: number;

  @Column("text")
  commentaire!: string;

  @Column("real")
  montant_initial!: number;

  @Column("real")
  montant_regle!: number;

  @Column("real")
  solde_du!: number;

  @Column("date")
  date!: Date;

  @Column({
    type: "enum",
    enum: ["Approuvée", "En cours", "Payée"],
  })
  statut!: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => MoyenPaiement)
  @JoinColumn({ name: "moyens_paiement_id" })
  moyenPaiement!: MoyenPaiement;

  @OneToMany(() => FactureArticleDetail, (detail) => detail.factureArticle, {
    cascade: true,
  })
  factureArticleDetails!: FactureArticleDetail[];
}
