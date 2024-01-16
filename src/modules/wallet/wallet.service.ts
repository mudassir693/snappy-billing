import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class WalletService {
    constructor(private _dbService: DatabaseService){}

    async createUserWallet(data: any): Promise<{success: boolean}>{
        try {
            let is_wallet_exist = await this._dbService.wallet.findFirst({where: {user_id: parseInt(data.user_id)}})
            if(is_wallet_exist){
                throw new BadRequestException("Wallet against this user already exist")
            }
            await this._dbService.wallet.create({data:{
                user_id: data.user_id,
                ...(data.account_id && {account_id: data.account_id}),
                amount: 5000
            }})
            return {
                success: true
            }
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    async createStaffWallet(data: any): Promise<{success: boolean}>{
        try {
            let is_wallet_exist = await this._dbService.wallet.findFirst({where: {user_id: parseInt(data.user_id), account_id: parseInt(data.account_id)}})
            if(is_wallet_exist){
                throw new BadRequestException("Wallet against this staff already exist")
            }
            await this._dbService.wallet.create({data:{
                user_id: data.user_id,
                ...(data.account_id && {account_id: data.account_id}),
                amount: 0
            }})
            return {
                success: true
            }
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    async getWallet(user: any){
        try {
            if(user.accountId){
                let staffWallet = await this._dbService.wallet.findFirst({where: {user_id: parseInt(user.userId), account_id: parseInt(user.accountId)}})
                return staffWallet
            }
            let userWallet = await this._dbService.wallet.findFirst({where: {user_id: parseInt(user.userId)}})
            return userWallet
        } catch (error) {
            throw new BadRequestException("")
        }
    }
}