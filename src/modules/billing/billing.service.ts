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

  private async _handleOngoingSubscription(
    on_going_plan: Billing,
    requested_subscription_id: number,
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
      invoice_id: on_going_plan.invoice[0].id,
      current_subscription_id: on_going_plan.subscription_id,
      request_subscription_id: requested_subscription_id,
      requested_action:
        current_subscription.price > requested_subscription.price
          ? SubscriptionChangeRequestRequestedAction.DOWNGRADE
          : SubscriptionChangeRequestRequestedAction.UPGRADE,
    };

    await this._subscriptionChangeRequestService.createOrUpdateChangeRequest(
      subscription_change_request_payload,
    );
  }

  async createBilling(billingData: any, userData: any) {
    try {
      let on_going_plan: Billing = await this._dbService.billing.findFirst({
        where: {
          user_id: userData.userId,
          invoice: {
            some: { expires_at: { gt: new Date() }, user_id: userData.userId },
          },
        },
        include: { invoice: true },
      });
      if (on_going_plan) {
        await this._handleOngoingSubscription(
          on_going_plan,
          billingData.subscription_id,
        );
        return {
          success: true,
          message: 'Your desired package will update from next cycle',
        };
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
          let invoice = await tx.invoice.create({
            data: {
              amount: create_billingData.amount,
              invoice_number:
                subscription.kitchen_id +
                '-' +
                subscription.name.substring(0, 4).toUpperCase() +
                '-' +
                Math.floor(Math.random() * 10000),
              kitchen_id: subscription.kitchen_id,
              user_id: userData.userId,
              status: invoiceStatus.PENDING,
              billing_id: create_billingData.id,
              plan_type: subscription.plan_type,
              expires_at: invoice_expiration_date.toISOString(),
            },
          });

          // check wallet balance
          let userWallet = await tx.wallet.findFirst({
            where: {
              user_id: userData.userId,
              ...(userData.accountId && { account_id: userData.accountId }),
            },
          });
          if (userWallet.amount > create_billingData.amount) {
            let new_wallet_amount =
              userWallet.amount - create_billingData.amount;

            await tx.wallet.update({
              where: { id: userWallet.id },
              data: { amount: new_wallet_amount },
            });

            let kitchen_owner_wallet = await tx.wallet.findFirst({
              where: {
                account_id: subscription.account_id,
              },
            });
            await tx.wallet.update({
              where: { id: kitchen_owner_wallet.id },
              data: { amount: kitchen_owner_wallet.amount + new_wallet_amount },
            });

            await tx.invoice.update({
              where: { id: invoice.id },
              data: { status: invoiceStatus.PAID },
            });
          }
        });
        return create_billingData;
      } catch (error) {
        throw new BadRequestException(error);
      }

      // try for payment from here
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async cancellBilling(billing_id: number, userData: any) {
    try {
      let billing = await this._dbService.billing.findUnique({
        where: { id: billing_id },
      });

      if (!billing) {
        throw new BadRequestException('We have no billing wrt this id');
      }

      let billing_date = moment(billing.createdAt);
      let todays_date = moment();
      // has five day passed
      let days_diff = todays_date.diff(billing_date, 'days');
      if (days_diff > 5) {
        throw new BadRequestException(
          'Sorry you are not able to cancel this billing',
        );
      }
      // if the days_diff <= 5 we have to return the amount by detecting 20% of the amount
      let detected_amount = billing.amount * 0.2;
      let return_amount = billing.amount - detected_amount;

      await this._dbService.$transaction(async (tx) => {
        // update wallet
        let user_wallet = await tx.wallet.findFirst({
          where: { user_id: userData.userId },
        });
        await tx.wallet.update({
          where: { id: user_wallet.id },
          data: { amount: user_wallet.amount + return_amount },
        });

        let subscription = await tx.snappySubscription.findFirst({
          where: { id: billing.subscription_id },
        });
        let staff_wallet = await tx.wallet.findFirst({
          where: { account_id: subscription.account_id },
        });
        await tx.wallet.update({
          where: { id: user_wallet.id },
          data: { amount: staff_wallet.amount - return_amount },
        });

        // update invoice status to cancel
        let invoice = await tx.invoice.findFirst({
          where: { billing_id: billing.id },
        });
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: invoiceStatus.CANCELLED },
        });

        await tx.billing.update({where: {id: billing.id},data: {status: billingStatus.CANCELLED}})
      });
      return {
        success: true
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
