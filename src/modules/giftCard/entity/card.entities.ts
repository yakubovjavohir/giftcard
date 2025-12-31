import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("gift_cards")
export class GiftCard {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 14,
    unique: true,
    nullable: false,
  })
  code!: string;

  // centsda saqlanadi: $10.00 = 1000
  @Column({ type: "integer" })
  balance!: number;

  @Column({ type: "varchar", length: 10, default: "USD" })
  currency!: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  @Column({ type: "varchar", unique: true, nullable: true })
  idempotency_key!: string | null;

  @Column({ type: "varchar", nullable: true })
  owner_email!: string | null
}
