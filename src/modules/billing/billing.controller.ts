import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../passport/guards/jwt.guard";
import { Billing } from "@prisma/client";
import { Public } from "src/decorators/public.decorator";

@Controller('/billing')
export class BillingController {
    constructor(private _billingService: BillingService){}

    @Post('/create')
    async CreateBilling(@Body() data: any, @Request() request: any): Promise<Billing | any>{
        let create_billing = await this._billingService.createBilling(data, request.user)

        return {
            token: request.user.token,
            create_billing: create_billing
        }
    }

    @Get('/cancel/:id')
    async cancelBilling(@Param('id') id: string, @Request() request: any){
        let cancelled_billing = await this._billingService.cancellBilling(parseInt(id), request.user)

        return {
            token: request.user.token,
            response: cancelled_billing
        }
    }
}