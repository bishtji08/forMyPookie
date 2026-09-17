'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, LayoutDashboard, FileHeart, Plus, MessageCircle, Bell,
  User, Settings, LogOut, Users, BarChart3, Flag, Menu, X
} from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const settingsHref =
    profile?.role === 'admin'
      ? '/admin/settings'
      : profile?.role === 'receiver'
      ? '/receiver/settings'
      : '/sender/settings';

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {nav.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/sender' &&
            item.href !== '/admin' &&
            item.href !== '/receiver' &&
            pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-gradient-to-r from-rose-400 to-lavender-400 text-white shadow-md shadow-rose-300/30 font-semibold'
                : 'text-rose-600/70 hover:bg-rose-50/60 hover:text-rose-700'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile Sticky Top Navbar ────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-rose-100/70 px-4 flex items-center justify-between z-30 shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-400/30" />
          <span className="font-display text-base font-bold text-rose-600">For My Pookie</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
            {profile?.role || 'User'}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer & Backdrop ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex"
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 max-w-[85vw] h-full bg-white flex flex-col shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100/60">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-400/30" />
                  <span className="font-display text-base font-bold text-rose-600">For My Pookie</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-2.5">
                <p className="text-xs text-rose-400/60 uppercase tracking-wider font-semibold">
                  {dashboardLabel}
                </p>
              </div>

              {/* Drawer Nav */}
              <NavLinks onItemClick={() => setMobileOpen(false)} />

              {/* Drawer Footer */}
              <div className="p-3 border-t border-rose-100/60 space-y-1">
                <Link
                  href={settingsHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/80 hover:bg-rose-50/70 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="truncate">{profile?.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/80 hover:bg-rose-50/70 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop Permanent Sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-white/80 backdrop-blur-lg border-r border-rose-100/50 flex-col z-30 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-rose-100/50">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-400/30" />
          <span className="font-display text-lg font-bold text-rose-600">For My Pookie</span>
        </Link>

        <div className="px-4 py-3">
          <p className="text-xs text-rose-400/50 uppercase tracking-wider font-medium mb-1">{dashboardLabel}</p>
        </div>

        <NavLinks />

        <div className="p-3 border-t border-rose-100/50">
          <Link
            href={settingsHref}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/70 hover:bg-rose-50/60 transition-all"
          >
            <User className="w-4 h-4" />
            <span className="truncate">{profile?.name || 'Profile'}</span>
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600/70 hover:bg-rose-50/60 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

