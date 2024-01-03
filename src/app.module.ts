import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './modules/passport/strategies/jwt.strategies';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RmqModule } from './rabbitmq/rabbitmq.module';
import { BillingModule } from './modules/orders/billing.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { SubscriptionChangeRequestModule } from './modules/subscription_change_request/subscription_change_request.module';

@Module({
  imports: [
    SubscriptionChangeRequestModule,
    BillingModule,
    SubscriptionModule,
    RmqModule.register({name: "BILLING"}),
    ConfigModule.forRoot({isGlobal: true}),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      // signOptions: { expiresIn: '1m' },
    })
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
