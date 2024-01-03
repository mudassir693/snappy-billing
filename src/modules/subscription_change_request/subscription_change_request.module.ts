import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { SubscriptionChangeRequestService } from "./subscription_change_request.service";

@Module({
    imports: [DatabaseModule],
    providers: [SubscriptionChangeRequestService],
    exports: [SubscriptionChangeRequestService]
})
export class SubscriptionChangeRequestModule {}