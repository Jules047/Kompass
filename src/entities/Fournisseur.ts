import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("fournisseurs")
export class Fournisseur {
  facturesAchat: any;
  static find(): any {
    throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  societe!: string;

  @Column()
  telephone!: string;

  @Column()
  adresse!: string;

  @Column()
  code_postal!: string;

  @Column()
  ville!: string;

  @Column()
  email!: string;

  @Column("real")
  solde_total!: number;
}
