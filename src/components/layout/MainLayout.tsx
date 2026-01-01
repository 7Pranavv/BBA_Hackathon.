import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  MessageSquare,
  TrendingUp,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Heart,
  UsersRound
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isSubscribed, tierName } = useSubscription();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Learning Paths', href: '/paths', icon: BookOpen },
    { name: 'Practice Problems', href: '/problems', icon: Code2 },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Discussions', href: '/discussions', icon: MessageSquare },
    { name: 'Mentorship', href: '/mentorship', icon: Users },
    { name: 'Cohorts', href: '/cohorts', icon: UsersRound },
  ];

  const secondaryNavigation = [
    { name: 'Subscriptions', href: '/subscriptions', icon: Crown, highlight: !isSubscribed },
    { name: 'Support Us', href: '/donate', icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Engineering Learn</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 z-40 flex flex-col`}
        >
          <div className="p-6 border-b border-gray-800 hidden lg:block">
            <h1 className="text-xl font-bold text-white">Engineering Learn</h1>
            <p className="text-xs text-gray-400 mt-1">Free Education Platform</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-800">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : item.highlight
                        ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.highlight && !active ? 'text-emerald-400' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                    {item.highlight && !active && (
                      <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800">
            {isSubscribed && (
              <div className="mb-3 px-3 py-2 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">{tierName} Member</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-0 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
