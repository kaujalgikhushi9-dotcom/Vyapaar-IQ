import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  Calculator,
  ShieldCheck,
  ReceiptText,
  Route,
  CreditCard,
  ChartNoAxesCombined,
  Activity,
  ChartColumnDecreasing,
  MessagesSquare,
  History,
  Users,
  Settings,
} from 'lucide-react'

export const navigation = [
  {
    label: 'Overview',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Your international earnings, made transparent.',
      },
      {
        path: '/earnings',
        label: 'Earnings Overview',
        icon: TrendingUp,
        description: 'Understand your income over time.',
      },
      {
        path: '/notifications',
        label: 'Notifications',
        icon: Bell,
        description: 'Your rate alerts and payment updates.',
      },
    ],
  },
  {
    label: 'Price & receive',
    items: [
      {
        path: '/pricing',
        label: 'Smart Pricing',
        icon: Calculator,
        description: 'Start with the rupees you want to receive.',
      },
      {
        path: '/buffer-studio',
        label: 'Safety Buffer Studio',
        icon: ShieldCheck,
        description: 'Explore the tradeoff between cushion and client price.',
      },
      {
        path: '/hisaab',
        label: 'Your Hisaab',
        icon: ReceiptText,
        description: 'Every estimated deduction, clearly accounted for.',
      },
      {
        path: '/money-journey',
        label: 'Money Journey',
        icon: Route,
        description: 'Follow a payment from client to estimated INR outcome.',
      },
      {
        path: '/checkout',
        label: 'Sandbox Checkout',
        icon: CreditCard,
        description: 'Test a fixed-price payment without moving real funds.',
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        path: '/analytics',
        label: 'Analytics',
        icon: ChartNoAxesCombined,
        description: 'Understand the patterns behind your payments.',
      },
      {
        path: '/rates',
        label: 'Rate Explorer',
        icon: Activity,
        description: 'Explore changes in the USD–INR reference rate.',
      },
      {
        path: '/leakage',
        label: 'Leakage Analysis',
        icon: ChartColumnDecreasing,
        description: 'Understand payment and conversion costs over time.',
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        path: '/assistant',
        label: 'Vyapaar IQ AI',
        icon: MessagesSquare,
        description: 'Ask pricing questions in plain language.',
      },
      {
        path: '/transactions',
        label: 'Transactions',
        icon: History,
        description: 'Find and inspect your payment records.',
      },
      {
        path: '/clients',
        label: 'Clients',
        icon: Users,
        description: 'Manage your international buyers and payment history.',
      },
      {
        path: '/settings',
        label: 'Settings',
        icon: Settings,
        description: 'Manage your workspace and calculation preferences.',
      },
    ],
  },
]

export const allPages = navigation.flatMap((group) => group.items)