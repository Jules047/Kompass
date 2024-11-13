import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Machine } from "./Machine";

@Entity("service_apres_vente")
export class ServiceApresVente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clients_id!: number;

  @Column()
  code_machines!: number;

  @Column({ type: "date", nullable: true })
  date_recuperation?: Date;

  @Column({ type: "date", nullable: true })
  date_restitution?: Date;

  @Column({ type: "date", nullable: true })
  date_rendu?: Date;

  @Column({
    type: "enum",
    enum: ["Cloturé", "Pret", "Restitué"],
  })
  etat!: "Cloturé" | "Pret" | "Restitué";

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: "code_machines" })
  machine!: Machine;
  
}
