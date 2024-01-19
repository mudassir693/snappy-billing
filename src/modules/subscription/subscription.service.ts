import { BadRequestException, Injectable } from "@nestjs/common";
import { Subscription } from "rxjs";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class SubscriptionService {
    constructor(private _dbService: DatabaseService){}

    async createSubscription(subscriptionData: any): Promise<Boolean>{
        try {
            await this._dbService.snappySubscription.create({
                data: {
                    id: subscriptionData.id,
                    name: subscriptionData.name,
                    description: subscriptionData.description,
                    type: subscriptionData.type,
                    price: subscriptionData.price,
                    allowedUser: subscriptionData.allowedUser,
                    account_id: subscriptionData.account_id,
                    kitchen_id: subscriptionData.kitchen_id,
                    plan_type: subscriptionData.plan_type || 1
                }
            })
            return true
        } catch (error) {
            throw new BadRequestException(error)
        }
    }
}