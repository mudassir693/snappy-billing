import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Billing, SnappySubscription } from '@prisma/client';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { billingStatus } from 'src/config/constants/billing.constants';
import { invoiceStatus } from 'src/config/constants/invoice.constants';
import { DatabaseService } from 'src/database/database.service';
import { SubscriptionChangeRequestService } from '../subscription_change_request/subscription_change_request.service';
import { SubscriptionChangeRequestRequestedAction } from 'src/config/constants/subscription_change_request.constants';

@Injectable()
export class BillingService {
  constructor(
    private _dbService: DatabaseService,
    private _subscriptionChangeRequestService: SubscriptionChangeRequestService,
  ) {}

  private async _handle_ongoing_subscription(
    on_going_plan: Billing,
    requested_subscription_id: number
  ) {
    let current_subscription: SnappySubscription;
    try {
        current_subscription =
        await this._dbService.snappySubscription.findUnique({
          where: { id: on_going_plan.subscription_id },
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    let requested_subscription: SnappySubscription;
    try {
      requested_subscription =
        await this._dbService.snappySubscription.findUnique({
          where: { id: requested_subscription_id },
        });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    if (!requested_subscription) {
      new NotFoundException('Invalid subscription_id');
    }
    let subscription_change_request_payload = {
        user_id: on_going_plan.user_id,
        // @ts-ignore
        invoice_id: on_going_plan.invoice.id,
        current_subscription_id: on_going_plan.subscription_id,
        request_subscription_id: requested_subscription_id,
        requested_action: current_subscription.price > requested_subscription.price ? SubscriptionChangeRequestRequestedAction.DOWNGRADE : SubscriptionChangeRequestRequestedAction.UPGRADE
    }

    await this._subscriptionChangeRequestService.createOrUpdateChangeRequest(subscription_change_request_payload)
  }

  async createBilling(billingData: any, userData: any) {
    try {
      let on_going_plan: Billing = await this._dbService.billing.findFirst({
        where: {
          user_id: userData.userId,
          invoice: { expires_at: { gt: new Date() } },
        },
        include: { invoice: true },
      });
      if(on_going_plan){
        await this._handle_ongoing_subscription(on_going_plan, billingData.subscription_id);
        return {
            success: true,
            message:"Your desired package will update from next cycle"
        }
      }
      let subscription: SnappySubscription;
      try {
        subscription = await this._dbService.snappySubscription.findUnique({
          where: { id: billingData.subscription_id },
        });
      } catch (error) {
        throw new BadRequestException(error);
      }
      if (!subscription) {
        throw new NotFoundException('invalid subscription reference');
      }





      let create_billingData: Billing;
      try {
        await this._dbService.$transaction(async (tx) => {
          create_billingData = await tx.billing.create({
            data: {
              subscription_id: subscription.id,
              user_id: userData.userId,
              status: billingStatus.PENDING,
              amount: subscription.price,
              address: billingData.address,
            },
          });
          let invoice_expiration_date = moment().add(1, 'months');
          await tx.invoice.create({
            data: {
              amount: create_billingData.amount,
              invoice_number: 100,
              status: invoiceStatus.PENDING,
              billing_id: create_billingData.id,
              plan_type: subscription.plan_type,
              expires_at: invoice_expiration_date.toISOString(),
            },
          });
        });
        return create_billingData;
      } catch (error) {
        throw new BadRequestException(error);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
