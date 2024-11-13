import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { PriseEnCharge } from "./PriseEnCharge";
import { Vendeur } from "./Vendeur";

@Entity("ticket")
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column()
  prises_en_charge_id!: number;

  @Column()
  vendeurs_id!: number;

  @Column({ length: 5 })
  blocage!: string;

  @Column({ length: 20 })
  urgence!: string;

  @Column({ length: 50, nullable: true })
  accessoire?: string;

  @Column("text")
  description!: string;

  @Column({ length: 30 })
  perimetre_panne!: string;

  @Column({ length: 30, default: 'En attente' })
  secteur_panne!: string;

  @Column({
    type: "enum",
    enum: ['En cours', 'En attente', 'Terminer', 'En pausse', 'En Clôture'],
  })
  statut_panne!: 'En cours' | 'En attente' | 'Terminer' | 'En pausse' | 'En Clôture';

  @Column({
    type: "enum",
    enum: ['Réseau', 'Hardware', 'Software'],
  })
  etat!: 'Réseau' | 'Hardware' | 'Software';

  @Column("date")
  date!: Date;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => PriseEnCharge)
  @JoinColumn({ name: "prises_en_charge_id" })
  priseEnCharge!: PriseEnCharge;

  @ManyToOne(() => Vendeur)
  @JoinColumn({ name: "vendeurs_id" })
  vendeur!: Vendeur;
}
