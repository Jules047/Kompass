import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { IsEmail, MinLength } from "class-validator";
import { hash } from "bcrypt";
import { Vendeur } from "./Vendeur";
import { Client } from "./Client";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @MinLength(3)
  username!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(6)
  password!: string;

  @Column({ default: "user" })
  role!: string;

  @Column({ nullable: true, type: "varchar", length: 255 })
  resetPasswordCode!: string | null;

  @Column({ nullable: true, type: "timestamp" })
  resetPasswordExpires!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  last_login!: Date;

  @OneToOne(() => Vendeur, { nullable: true })
  @JoinColumn()
  vendeur?: Vendeur;

  @OneToOne(() => Client, { nullable: true })
  @JoinColumn()
  client?: Client;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      // Check if password is not already hashed
      this.password = await hash(this.password, 10);
    }
  }
}
