import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("segmentation")
export class Segmentation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column("text")
  commentaire!: string;
}
