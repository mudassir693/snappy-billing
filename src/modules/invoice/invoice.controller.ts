import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { Public } from "src/decorators/public.decorator";

@Controller('/invoice')
export class InvoiceController {
    constructor(private _invoiceService: InvoiceService){}

    @Get('/get')
    async getInvoice(@Query() data: any, @Request() request: any){
        let invoices = await this._invoiceService.getInvoice(data)
        return {
            request: request.user.token,
            response: invoices
        }
    }

    async GetUserInvoices(@Request() request: any){
        let invoices = await this._invoiceService.getUserInvoices(request.user.userId)
        return {
            request: request.user.token,
            response: invoices
        }
    }

    // Order Info for kitchen how much subscription they hhad on Monthly basis.
    async GetKitchenInvoices(@Request() request: any){
        let invoices = await this._invoiceService.getUserInvoices(request.user.accountId)
        return {
            request: request.user.token,
            response: invoices
        }
    }


    @Public()
    @Get('/get/:id')
    async getInvoiceById(@Param('id') invoiceId: any){
        let invoices = await this._invoiceService.getInvoice(invoiceId)
        return {
            response: invoices
        }
    }


}