import type { Request, Response } from "express"
import { giftService, GiftService } from "./gift.service.js"
import { randomUUID } from "node:crypto"

class GiftController {
    constructor(
        private readonly giftService: GiftService
    ) {}



    async createGiftCard(req: Request, res: Response) {
        try {
            const gift = await this.giftService.createGiftCard(req.body)
            res.status(201).json(gift)
        } catch (error:any) {
            res.status(400).json({ message: error.message })
        }
    }




    async readGiftCard(req:Request, res:Response) {
        const { code } = req.params as { code: string }
        try {
            const gift = await this.giftService.readGiftCard(code)
            if (!gift) {
                return res.status(404).json({ message: "Gift card not found" })
            }
            const returnData = {
                balance: gift.balance,
                currency: gift.currency,
                is_active: gift.is_active,
                created_at: gift.created_at,
                updated_at: gift.updated_at,
            }
            res.json(returnData)
        } catch (error:any) {
            res.status(400).json({ message: error.message })
        }
    }





    async checkGiftCardBalance(req:Request, res:Response) {
        const {code} = req.params as {code: string}
        try {
            const balanceInfo = await this.giftService.checkGiftCardBalance(code)
            res.json(balanceInfo)
        } catch (error:any) {
            res.status(400).json({ message: error.message })
        }
    }





    async splitCard(req: Request, res: Response) {
        const baseReferenceId =req.body.reference_id ?? randomUUID();
        const { sourceCode, splitAmount, newOwnerEmail } = req.body as {
          sourceCode: string;
          splitAmount: number;
          newOwnerEmail: string;
        };
        try {
          const result = await this.giftService.splitCard(sourceCode, splitAmount, newOwnerEmail, baseReferenceId);
          res.status(200).json(result);
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
    }



    async spendCard(req: Request, res: Response){
      try {
        const { code, amount } = req.body;
        const reference_id = req.body.reference_id ?? `order_${randomUUID()}`;
        
        if (!code || !amount) {
          return res.status(400).json({ message: "Missing fields" });
        }

        const result = await this.giftService.spend(
          code,
          amount,
          reference_id
        );

        res.json(result);
      } catch (err: any) {
        res.status(400).json({ message: err.message });
      }
    };



    async refundCard(req: Request, res: Response){
      try {
        const { code } = req.body;
        const reference_id = req.body.reference_id ?? `order_${randomUUID()}`;
        
        if (!code) {
          return res.status(400).json({ message: "Missing fields" });
        }

        const result = await this.giftService.refund(
          code,
          reference_id
        );

        res.json(result);
      } catch (err: any) {
        res.status(400).json({ message: err.message });
      }
    }
}
export const giftController = new GiftController(giftService) 