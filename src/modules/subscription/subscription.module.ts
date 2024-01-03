import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { RmqModule } from "src/rabbitmq/rabbitmq.module";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";

@Module({
    imports: [DatabaseModule, RmqModule],
    providers: [SubscriptionService],
    controllers: [SubscriptionController]
})
export class SubscriptionModule {}