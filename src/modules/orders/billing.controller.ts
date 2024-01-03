import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../passport/guards/jwt.guard";
import { Billing } from "@prisma/client";

@Controller('/billing')
export class BillingController {
    constructor(private _billingService: BillingService){}

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async CreateBilling(@Body() data: any, @Request() request: any): Promise<Billing | any>{
        let create_billing = await this._billingService.createBilling(data, request.user)

        return {
            token: request.user.token,
            create_billing: create_billing
        }
    }
}