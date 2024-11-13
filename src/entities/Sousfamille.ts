import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Famille } from "./Famille";

@Entity("sousfamilles")
export class Sousfamille {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, nullable: false })
  designation!: string;

  @Column({ name: "famille_id" })
  familleId!: number;

  @ManyToOne(() => Famille, (famille) => famille.sousfamilles, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "famille_id" })
  famille!: Famille;
}
