import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Invoice } from "@prisma/client";
import { NotFoundError } from "rxjs";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class InvoiceService {
    constructor(private _dbService: DatabaseService){}
    
    async getInvoice(data: any): Promise<{invoices: Invoice[]}>{
        try {
            let whereParams: any = {}
            if(data.kitchen_id){
                whereParams.kitchen_id = parseInt(data.kitchen_id)
            }
            if(data.user_id){
                whereParams.user_id = parseInt(data.user_id)
            }
            let invoices: Invoice[]  = await this._dbService.invoice.findMany({where: whereParams})
            return {
                invoices
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getInvoiceById(invoice_id: number): Promise<{invoice:Invoice}>{
        try {
            let invoice: Invoice;
            try {
                invoice = await this._dbService.invoice.findUnique({where: {id: invoice_id}})
            } catch (error) {
                throw new BadRequestException(error)
            }

            if(!invoice){
                throw new NotFoundException("invoice not found")
            }
            return {
                invoice
            }

        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}