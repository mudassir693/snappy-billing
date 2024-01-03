import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { BillingService } from "./billing.service";
import { BillingController } from "./billing.controller";
import { SubscriptionChangeRequestModule } from "../subscription_change_request/subscription_change_request.module";

@Module({
    imports: [DatabaseModule, SubscriptionChangeRequestModule],
    providers: [BillingService],
    controllers: [BillingController]
})

export class BillingModule {}