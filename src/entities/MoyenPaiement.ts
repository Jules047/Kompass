import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("moyens_paiement")
export class MoyenPaiement {
  static find(): any {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  moyen!: string;
}
