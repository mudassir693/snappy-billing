import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { RmqModule } from "src/rabbitmq/rabbitmq.module";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Module({
    imports: [DatabaseModule, RmqModule],
    controllers: [WalletController],
    providers: [WalletService]
})

export class WalletModule {}