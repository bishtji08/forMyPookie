'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LayoutDashboard, FileHeart, Plus, Image, MessageCircle, Bell, User, Settings, LogOut, Users, BarChart3, Flag, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const senderNav: NavItem[] = [
  { href: '/sender', label: 'Overview', icon: LayoutDashboard },
  { href: '/sender/experiences', label: 'My Experiences', icon: FileHeart },
  { href: '/sender/create', label: 'Create Experience', icon: Plus },
  { href: '/sender/messages', label: 'Messages', icon: MessageCircle },
  { href: '/sender/notifications', label: 'Notifications', icon: Bell },
  { href: '/sender/settings', label: 'Settings', icon: Settings },
];

const receiverNav: NavItem[] = [
  { href: '/receiver', label: 'My Experience', icon: FileHeart },
  { href: '/receiver/messages', label: 'Messages', icon: MessageCircle },
  { href: '/receiver/notifications', label: 'Notifications', icon: Bell },
  { href: '/receiver/settings', label: 'Settings', icon: Settings },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/relationships', label: 'Relationships', icon: FileHeart },
  { href: '/admin/messages', label: 'Messages', icon: MessageCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  let nav: NavItem[] = [];
  let dashboardLabel = '';
  if (profile?.role === 'admin') {
    nav = adminNav;
    dashboardLabel = 'Admin Panel';
  } else if (profile?.role === 'receiver') {
    nav = receiverNav;
    dashboardLabel = 'My Space';
  } else {
    nav = senderNav;
    dashboardLabel = 'Sender Dashboard';
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white/80 backdrop-blur-lg border-r border-rose-100/50 flex flex-col z-30">
      <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-rose-100/50">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-400/30" />
        <span className="font-display text-lg font-bold text-rose-600">For My Pookie</span>
      </Link>

      <div className="px-4 py-3">
        <p className="text-xs text-rose-400/50 uppercase tracking-wider font-medium mb-1">{dashboardLabel}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/sender' && item.href !== '/admin' && item.href !== '/receiver' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-md shadow-rose-300/30'
                  : 'text-rose-600/70 hover:bg-rose-50/60 hover:text-rose-700'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-rose-100/50">
        <Link
          href={profile?.role === 'admin' ? '/admin/settings' : profile?.role === 'receiver' ? '/receiver/settings' : '/sender/settings'}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/70 hover:bg-rose-50/60 transition-all"
        >
          <User className="w-4 h-4" />
          {profile?.name || 'Profile'}
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/70 hover:bg-rose-50/60 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
