import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,UpdateDateColumn,OneToMany,} from "typeorm";
import { Client } from "./Client";
import { MoyenPaiement } from "./MoyenPaiement";
import { CommandeArticle } from "./CommandeArticle";

@Entity("commandes")
export class Commande {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column()
  moyens_paiement_id!: number;

  @Column("real")
  tarif!: number;

  @Column("real", { default: 0 })
  acompte!: number;

  @Column("real")
  reste_payer!: number;

  @Column()
  commentaire!: string;

  @Column("date")
  date_creation!: Date;

  @Column({ type: "timestamp", nullable: true })
  date_commande!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  date_arrivee!: Date | null;

  @Column({ nullable: true })
  signature_path!: string;

  @Column({ type: "boolean", default: false })
  annulee!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: "timestamp", nullable: true })
  date_annulation!: Date | null;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => MoyenPaiement)
  @JoinColumn({ name: "moyens_paiement_id" })
  moyenPaiement!: MoyenPaiement;

  @OneToMany(
    () => CommandeArticle,
    (commandeArticle) => commandeArticle.commande,
    {
      cascade: true,
    }
  )
  commandeArticles!: CommandeArticle[];
}
