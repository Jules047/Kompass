import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Client } from "./Client";
import { Article } from "./Article";
import { Machine } from "./Machine";
import { Vendeur } from "./Vendeur";
import { PriseEnChargeArticle } from "./PriseEnChargeArticle";

@Entity("prises_en_charge")
export class PriseEnCharge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column({ nullable: true })
  article_id?: number;

  @Column()
  machines_id!: number;

  @Column()
  vendeurs_id!: number;

  @Column("text", { nullable: true })
  mot_de_passe_windows?: string;

  @Column("text")
  symptome!: string;

  @Column("text", { nullable: true })
  batterie?: string;

  @Column("text", { nullable: true })
  chargeur?: string;

  @Column("text", { nullable: true })
  accessoire?: string;

  @Column("real")
  prix_total!: number;

  @Column({
    type: "enum",
    enum: ["PEC", "Pret"],
  })
  statut!: "PEC" | "Pret";

  @Column("varchar", { nullable: true })
  signature_path?: string;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  date: string | number | Date = new Date();

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => Article)
  @JoinColumn({ name: "article_id" })
  article?: Article;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: "machines_id" })
  machine!: Machine;

  @ManyToOne(() => Vendeur)
  @JoinColumn({ name: "vendeurs_id" })
  vendeur!: Vendeur;

  @OneToMany(
    () => PriseEnChargeArticle,
    (priseEnChargeArticle) => priseEnChargeArticle.priseEnCharge
  )
  priseEnChargeArticles!: PriseEnChargeArticle[];
}
