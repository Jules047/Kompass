import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Segmentation } from "./Segmentation";


@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  segment_id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ length: 100 })
  prenom!: string;

  @Column({ length: 20 })
  telephone!: string;

  @Column({ length: 255 })
  adresse!: string;

  @Column({ length: 10 })
  code_postal!: string;

  @Column({ length: 100 })
  ville!: string;

  @Column({ length: 255 })
  email!: string;

  @Column("real", { default: 0 })
  soldes!: number;

  @Column({ length: 100, nullable: true })
  entreprise?: string;

  @Column({ default: true })
  actif!: boolean;

  @ManyToOne(() => Segmentation)
  @JoinColumn({ name: "segment_id" })
  segment!: Segmentation;


}
