import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GiftCard } from "../../giftCard/entity/card.entities.js";

@Entity()
@Index(["reference_id"], { unique: true })
export class GiftCardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GiftCard)
  card!: GiftCard;

  @Column({ type: "integer" })
  amount!: number;

  @Column({type: "varchar", length: 20})
  type!: string;

  @Column({ type: "varchar", nullable: true })
  reference_id!: string | null;
}