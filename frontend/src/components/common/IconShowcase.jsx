import React from 'react'
import {
  BarChart3, 
  Shield, 
  Globe2, 
  Settings, 
  CreditCard, 
  Users, 
  Building2,
  TrendingUp,
  Play,
  Activity,
  Monitor,
  Database,
  Heart,
  Lock,
  Cpu,
  Gauge,
  Code,
  Zap,
  Target,
  Palette,
  Layers,
  Command,
  Bot,
  ShieldCheck,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  Calendar,
  FileText,
  Bell,
  Mail,
  Phone,
  MapPin,
  Server,
  HardDrive,
  Network,
  Wifi,
  ShieldAlert,
  Key,
  UserCheck,
  UserX,
  Settings2,
  Cog,
  Tool,
  Wrench,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  Star,
  Award,
  Trophy,
  Gift,
  ShoppingCart,
  Wallet,
  Receipt,
  Calculator,
  Flag
} from 'lucide-react'

const IconShowcase = () => {
  const iconCategories = [
    {
      name: 'Navigation & Core',
      icons: [
        { name: 'Dashboard', icon: BarChart3, color: 'text-blue-600' },
        { name: 'Domains', icon: Globe2, color: 'text-green-600' },
        { name: 'Rules', icon: ShieldCheck, color: 'text-purple-600' },
        { name: 'Traffic', icon: Network, color: 'text-orange-600' },
        { name: 'Analytics', icon: LineChart, color: 'text-indigo-600' },
        { name: 'ML Models', icon: Bot, color: 'text-pink-600' },
        { name: 'Protection', icon: ShieldAlert, color: 'text-red-600' },
        { name: 'Billing', icon: Wallet, color: 'text-emerald-600' },
        { name: 'Security', icon: Shield, color: 'text-cyan-600' },
        { name: 'Performance', icon: Zap, color: 'text-yellow-600' },
        { name: 'Reporting', icon: PieChart, color: 'text-violet-600' },
        { name: 'API Management', icon: Code, color: 'text-gray-600' },
      ]
    },
    {
      name: 'Admin & System',
      icons: [
        { name: 'User Management', icon: UserCheck, color: 'text-blue-500' },
        { name: 'System Monitoring', icon: Server, color: 'text-green-500' },
        { name: 'Security Ops', icon: ShieldCheck, color: 'text-purple-500' },
        { name: 'System Health', icon: Heart, color: 'text-red-500' },
        { name: 'Client Management', icon: Building2, color: 'text-orange-500' },
        { name: 'Tenants', icon: Building2, color: 'text-indigo-500' },
        { name: 'Feature Flags', icon: Flag, color: 'text-pink-500' },
        { name: 'White Label', icon: Palette, color: 'text-emerald-500' },
      ]
    },
    {
      name: 'Actions & Tools',
      icons: [
        { name: 'Add', icon: Plus, color: 'text-green-600' },
        { name: 'Edit', icon: Edit, color: 'text-blue-600' },
        { name: 'Delete', icon: Trash2, color: 'text-red-600' },
        { name: 'Search', icon: Search, color: 'text-gray-600' },
        { name: 'Filter', icon: Filter, color: 'text-gray-600' },
        { name: 'Download', icon: Download, color: 'text-green-600' },
        { name: 'Upload', icon: Upload, color: 'text-blue-600' },
        { name: 'Copy', icon: Copy, color: 'text-gray-600' },
        { name: 'Share', icon: Share2, color: 'text-purple-600' },
        { name: 'Settings', icon: Cog, color: 'text-gray-600' },
        { name: 'Tools', icon: Wrench, color: 'text-orange-600' },
        { name: 'Command', icon: Command, color: 'text-indigo-600' },
      ]
    },
    {
      name: 'Status & Feedback',
      icons: [
        { name: 'Success', icon: Check, color: 'text-green-600' },
        { name: 'Error', icon: X, color: 'text-red-600' },
        { name: 'Warning', icon: AlertTriangle, color: 'text-yellow-600' },
        { name: 'Info', icon: Info, color: 'text-blue-600' },
        { name: 'Help', icon: HelpCircle, color: 'text-gray-600' },
        { name: 'Star', icon: Star, color: 'text-yellow-500' },
        { name: 'Award', icon: Award, color: 'text-purple-600' },
        { name: 'Trophy', icon: Trophy, color: 'text-yellow-600' },
      ]
    }
  ]

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-yandex mb-2">
          🎨 Enhanced Icon Showcase
        </h1>
        <p className="text-gray-600 font-yandex">
          Beautiful icon selection with Inter font family
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {iconCategories.map((category) => (
          <div key={category.name} className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 font-yandex mb-4 border-b border-gray-200 pb-2">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {category.icons.map((iconItem) => (
                <div
                  key={iconItem.name}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`p-3 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors duration-200 mb-2`}>
                    <iconItem.icon className={`w-6 h-6 ${iconItem.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 font-yandex text-center">
                    {iconItem.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 font-yandex mb-3">
          ✨ Font Family: Inter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-light text-blue-800 font-yandex">Light Weight</p>
            <p className="text-sm text-blue-600">300</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-normal text-blue-800 font-yandex">Regular Weight</p>
            <p className="text-sm text-blue-600">400</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-800 font-yandex">Bold Weight</p>
            <p className="text-sm text-blue-600">700</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IconShowcase
