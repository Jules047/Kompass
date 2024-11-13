import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { FactureArticle } from "./FactureArticle";
import { Devis } from "./Devis";
import { Article } from "./Article";

@Entity("historique_facturation")
export class HistoriqueFacturation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  factures_article_id?: number;

  @Column({ nullable: true })
  devis_id?: number;

  @Column()
  clients_id!: number;

  @Column()
  article_id!: number;

  @Column("date")
  date_creation!: Date;

  @Column()
  type_document!: 'FACTURE' | 'DEVIS';

  @ManyToOne(() => Client)
  @JoinColumn({ name: "clients_id" })
  client!: Client;

  @ManyToOne(() => FactureArticle)
  @JoinColumn({ name: "factures_article_id" })
  factureArticle?: FactureArticle;

  @ManyToOne(() => Devis)
  @JoinColumn({ name: "devis_id" })
  devis?: Devis;

  @ManyToOne(() => Article)
  @JoinColumn({ name: "article_id" })
  article!: Article;
}
