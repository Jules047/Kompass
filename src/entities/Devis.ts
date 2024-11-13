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
import { DevisArticle } from "./DevisArticle";

@Entity("devis")
export class Devis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column()
  moyens_paiement_id!: number;

  @Column("text")
  commentaire!: string;

  @Column("real")
  tarif!: number;

  @Column("real", { default: 0 })
  acompte!: number;

  @Column("real")
  reste_payer!: number;

  @Column("date")
  date!: Date;

  @Column("varchar", { nullable: true })
  signature_path!: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @OneToMany(() => DevisArticle, (devisArticle) => devisArticle.devis, {
    cascade: true,
  })
  devisArticles!: DevisArticle[];

  @ManyToOne(() => MoyenPaiement)
  @JoinColumn({ name: "moyens_paiement_id" })
  moyenPaiement!: MoyenPaiement;
}
