import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { RmqService } from "src/rabbitmq/rabbitmq.service";
import { SubscriptionService } from "./subscription.service";

@Controller()
export class SubscriptionController {
    constructor(private _subscriptionService: SubscriptionService, private _rmqService: RmqService){}

    @EventPattern('subscription_create')
    async subscriptionCreated(@Payload() data: any, @Ctx() context: RmqContext){
        let subscription_create = await this._subscriptionService.createSubscription(data)
        if(subscription_create){
            this._rmqService.ack(context)
        }
    }
}