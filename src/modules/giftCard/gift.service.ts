import { giftRepository } from "./gift.repository.js"
import { GiftCard } from "./entity/card.entities.js"
import {generateGiftCode} from "../../lib/generation.code.js"
import { DataSource, Repository } from "typeorm";
import { GiftCardTransaction } from "./entity/transaction.entities.js";
import { AppDataSource } from "../../config/data.sourc.js";
export class GiftService {
    constructor(
        private readonly giftRepository: Repository<GiftCard>,
        private readonly dataSource: DataSource
    ) {}


    // create card
    async createGiftCard(data: {balance: number; currency?: string; idempotency_key?: string;}) {
        let { balance, currency, idempotency_key } = data;

        if (balance <= 0) {
            throw new Error("Balance must be greater than 0");
        }

        if (idempotency_key) {
            const existing = await this.giftRepository.findOne({
                where: { idempotency_key },
            });

        if (existing) {
            return {
                balance: existing.balance,
                currency: existing.currency,
                code: existing.code,
                reused: true,
            };
          }
        }

        const gift = this.giftRepository.create({
            balance,
            currency : currency == '' ? 'USD' : currency,
            code: await this.generateUniqueGiftCode(),
            idempotency_key: idempotency_key ?? undefined,
        });

        const saved = await this.giftRepository.save(gift);

        return {
            balance: saved.balance,
            currency: saved.currency,
            code: saved.code,
            reused: false,
        };
    }





    // read card
    readGiftCard(code: string) {
        return this.giftRepository.findOne({ where: { code } })
    }





    // generate unique code
    async generateUniqueGiftCode(): Promise<string> {
        const code = generateGiftCode();

        const exists = await this.giftRepository.findOne({
            where: { code },
            select: ["id"],
        });

        if (exists) {
            return this.generateUniqueGiftCode();
        }

        return code as string
    }
    




    // check balance
    async checkGiftCardBalance(code: string) {

      const gift = await this.giftRepository.findOne({
        where: { code }
      });
                    
      if (!gift) {
        return {
          "valid": false,
          "reason": "CARD_NOT_FOUND"
        }
      }

      if(gift?.is_active === false){
        return {
          "valid": false,
          "reason": "CARD_INACTIVE"
        }
      }


      if(gift?.balance as number <= 0){
        return {
          "valid": false,
          "reason": "not enough balance"
        }
      }

      return {
        "valid": true,
        "balance": gift?.balance,
        "currency": gift?.currency
      }
    }






    // split
    async splitCard(sourceCode: string, splitAmount: number, newOwnerEmail: string, baseReferenceId: string) {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {

      const sourceCard = await transactionalEntityManager.findOne(GiftCard, {
        where: { code: sourceCode },
        lock: { mode: "pessimistic_write" } 
      });

      if (!sourceCard) throw new Error("Invalid Card");
      if (sourceCard.balance < splitAmount) throw new Error("Insufficient Funds");

      sourceCard.balance -= splitAmount;
      await transactionalEntityManager.save(sourceCard);

      const log = new GiftCardTransaction()
      log.card = sourceCard;
      log.amount = -splitAmount;
      log.type = "SPLIT_OUT";
      log.reference_id = `${baseReferenceId}_OUT`;
      await transactionalEntityManager.save(log);


      const newCard = new GiftCard();
      newCard.balance = splitAmount;
      newCard.owner_email = newOwnerEmail;
      newCard.currency = sourceCard.currency;
      newCard.code = await this.generateUniqueGiftCode(); 
      await transactionalEntityManager.save(newCard);


      const inLog = new GiftCardTransaction();
      inLog.card = newCard.id as unknown as GiftCard;
      inLog.amount = +splitAmount;
      inLog.type = "SPLIT_IN";
      inLog.reference_id = `${baseReferenceId}_IN`;
      await transactionalEntityManager.save(inLog);

      if(sourceCard.balance == 0){
        sourceCard.is_active = false;
        await transactionalEntityManager.save(sourceCard);
      }
      return { original_remaining: sourceCard.balance, new_card: {code:newCard.code, balance:newCard.balance}, };
    });
  }






  // spend
  async spend(code: string, amount: number, referenceId: string) {
    return this.dataSource.transaction(async (manager) => {
      const card = await manager.findOne(GiftCard, {
        where: { code },
        lock: { mode: "pessimistic_write" },
      });

      if (!card) throw new Error("Card not found");
      if (!card.is_active) throw new Error("Card inactive");
      if (card.balance < amount) throw new Error("Insufficient balance");

      const existingTx = await manager.findOne(GiftCardTransaction, {
        where: { reference_id: referenceId },
      });
      if (existingTx) {
        return {
          remaining_balance: card.balance,
          message: "Already processed",
        };
      }

      const tx = new GiftCardTransaction();
      tx.card = card;
      tx.amount = -amount; 
      tx.type = 'SPEND';
      tx.reference_id = referenceId;
      await manager.save(tx);

      card.balance -= amount;
      if (card.balance === 0) {
        card.is_active = false;
      }
      await manager.save(card);

      return {
        remaining_balance: card.balance,
      };
    });
  }





  // refund
  async refund(cardCode: string, referenceId: string) {
    return await this.dataSource.transaction(async (manager) => {

      const card = await manager.findOne(GiftCard, {
        where: { code: cardCode },
        lock: { mode: "pessimistic_write" }
      });

      if (!card) throw new Error("Invalid card");

      const spendTx = await manager.findOne(GiftCardTransaction, {
        where: {
          card: { id: card.id },
          reference_id: referenceId,
          type: "SPEND"
        }
      });

      if (!spendTx)
        throw new Error("Original spend not found");

      const alreadyRefunded = await manager.findOne(GiftCardTransaction, {
        where: {
          reference_id: `${referenceId}_REFUND`
        }
      });

      if (alreadyRefunded)
        throw new Error("Already refunded");

      card.balance += Math.abs(spendTx.amount);
      card.is_active = true;
      await manager.save(card);

      const refundTx = new GiftCardTransaction();
      refundTx.card = card;
      refundTx.amount = Math.abs(spendTx.amount);
      refundTx.type = "REFUND";
      refundTx.reference_id = `${referenceId}_REFUND`;
      await manager.save(refundTx);

      return {
        refunded_amount: refundTx.amount,
        new_balance: card.balance
      };
    });
  }

}

export const giftService = new GiftService(giftRepository, AppDataSource)