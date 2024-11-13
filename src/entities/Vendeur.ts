import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("vendeurs")
export class Vendeur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ length: 100 })
  prenom!: string;

  @Column({ length: 255 })
  email!: string;

  @Column("text")
  adresse!: string;

  @Column({ length: 10 })
  code_postal!: string;

  @Column({ length: 100 })
  ville!: string;

  @Column({ length: 20, nullable: true })
  telephone1?: string;

  @Column({ length: 20, nullable: true })
  telephone2?: string;
}
