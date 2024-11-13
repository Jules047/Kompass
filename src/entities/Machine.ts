import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("machines")
export class Machine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  label!: string;

  @Column({ length: 100 })
  marque!: string;

  @Column({ length: 50 })
  couleur!: string;
}
