import { Controller } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { RmqService } from "src/rabbitmq/rabbitmq.service";

@Controller('wallet')
export class WalletController {
    constructor(private _walletService: WalletService, private _rmqService: RmqService){}

    @EventPattern('user_created')
    async userCreated(@Payload() data: any, @Ctx() context: RmqContext){
        let wallet_create = await this._walletService.createUserWallet(data)
        if(wallet_create['success']){
            this._rmqService.ack(context)
        }
    }

    @EventPattern('staff_created')
    async staffCreated(@Payload() data: any, @Ctx() context: RmqContext){
        console.log('staff_created: ', data)
        let wallet_create = await this._walletService.createStaffWallet(data)
        if(wallet_create['success']){
            this._rmqService.ack(context)
        }
    }
}