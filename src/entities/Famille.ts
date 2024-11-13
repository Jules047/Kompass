import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Article } from "./Article";
import { Sousfamille } from "./Sousfamille";

@Entity("familles")
export class Famille {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, nullable: true })
  designation!: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  tva!: number;

  @OneToMany(() => Article, (article) => article.famille)
  articles!: Article[];

  @OneToMany(() => Sousfamille, (sousfamille) => sousfamille.famille)
  sousfamilles!: Sousfamille[];
}
