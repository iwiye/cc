import type {
  User,
  CreatorProfile,
  SubscriberProfile,
  Content,
  Subscription,
  Transaction,
  Withdrawal,
  Role,
  ContentType,
  ContentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  WithdrawalStatus,
} from "@prisma/client"

// Re-export des types Prisma
export type {
  User,
  CreatorProfile,
  SubscriberProfile,
  Content,
  Subscription,
  Transaction,
  Withdrawal,
  Role,
  ContentType,
  ContentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  WithdrawalStatus,
}

// Types étendus
export type UserWithProfile = User & {
  creatorProfile: CreatorProfile | null
  subscriberProfile: SubscriberProfile | null
}

export type CreatorWithUser = CreatorProfile & {
  user: Pick<User, "id" | "email" | "phone">
}

export type CreatorWithContent = CreatorProfile & {
  user: Pick<User, "id" | "email">
  contents: Content[]
  _count: {
    subscriptions: number
    contents: number
  }
}

export type ContentWithCreator = Content & {
  creator: CreatorProfile & {
    user: Pick<User, "id" | "email">
  }
}

export type SubscriptionWithDetails = Subscription & {
  subscriber: SubscriberProfile & {
    user: Pick<User, "id" | "email">
  }
  creator: CreatorProfile & {
    user: Pick<User, "id" | "email">
  }
}

// Types pour les réponses API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Types pour la pagination
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Types pour les statistiques
export interface CreatorStats {
  totalSubscribers: number
  activeSubscribers: number
  totalEarnings: number
  monthlyEarnings: number
  totalViews: number
  totalContent: number
}

export interface AdminStats {
  totalUsers: number
  totalCreators: number
  totalSubscribers: number
  totalTransactions: number
  totalRevenue: number
  pendingWithdrawals: number
  pendingKyc: number
}

// Types pour les prix d'abonnement
export interface SubscriptionPrices {
  weekly: number
  monthly: number
  quarterly: number
}
