import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class SubscriptionChangeRequestService {
    constructor(private _dbService: DatabaseService){}

    async createOrUpdateChangeRequest(change_plan_request: any){
        try {
            let is_request_exist = await this._dbService.subscriptionChangeRequest.findFirst({where:{user_id: change_plan_request.user_id, change_processed: false}})
            if(is_request_exist){
                await this._dbService.subscriptionChangeRequest.update({where:{id: is_request_exist.id}, data:{request_subscription_id: change_plan_request.request_subscription_id}})
                return true 
            }
            await this._dbService.subscriptionChangeRequest.create({
                data: {
                    user_id: change_plan_request.user_id,
                    invoice_id: change_plan_request.invoice_id,
                    current_subscription_id: change_plan_request.current_subscription_id,
                    request_subscription_id: change_plan_request.request_subscription_id,
                    requested_action: change_plan_request.requested_action
                }
            })
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}