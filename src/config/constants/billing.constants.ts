export enum billingStatus {
    PENDING = 1,
    SUCCESS = 2,
    FAILED = 3, // status move to failed from pending after 5 day of billing if payment is not done
    REFUNDED = 4,
    CANCELLED = 5 // canceled by user
}