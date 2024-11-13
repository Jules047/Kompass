import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Famille } from "./Famille";
import { Stock } from "./Stock";
import { Sousfamille } from "./Sousfamille";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  designation!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  quantite!: number;

  @Column()
  type!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  prix_achat!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  prix_ht!: number;

  @Column("decimal", { precision: 5, scale: 2 })
  marge_pourcent!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  marge_num!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  prix_ttc!: number;

  @Column({ default: false })
  complet!: boolean;

  @Column()
  famille_id!: number;

  @ManyToOne(() => Famille, (famille) => famille.articles)
  @JoinColumn({ name: "famille_id" })
  famille!: Famille;

  @OneToMany(() => Stock, (stock) => stock.article)
  stocks!: Stock[];

  @ManyToOne(() => Sousfamille, { eager: true })
  @JoinColumn({ name: "sousfamille_id" })
  sousfamille!: Sousfamille;

  @Column({ nullable: true })
  sousfamille_id!: number;
}

