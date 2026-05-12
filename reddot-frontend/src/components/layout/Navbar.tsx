"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Settings, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pb } from '@/lib/pocketbase';
import { SiteConfig, INITIAL_CONFIG } from '@/lib/cms-store';
import { resolveAssetUrl } from '@/lib/asset-url';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);

  useEffect(() => {
    // Auth state
    setUser(pb.authStore.model);
    const unsub = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    // Fetch config & Subscribe
    const fetchConfig = async () => {
      try {
        const result = await pb.collection('site_config').getList(1, 1, { sort: '-created', requestKey: 'navbar-config' });
        if (result.items.length > 0) {
          setConfig({ ...INITIAL_CONFIG, ...result.items[0].data });
        }
      } catch (e: any) {
        if (e?.isAbort) return;
        console.warn('[Navbar fetchConfig] failed:', e?.message);
      }
    };
    fetchConfig();

    pb.collection('site_config').subscribe('*', (e) => {
      if (e.action === 'update' || e.action === 'create') {
        setConfig({ ...INITIAL_CONFIG, ...e.record.data });
      }
    }).catch(() => {});

    return () => {
      unsub();
      pb.collection('site_config').unsubscribe();
    };
  }, []);

  const handleSignOut = () => {
    pb.authStore.clear();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            {config.companyLogoUrl ? (
              <img
                src={resolveAssetUrl(config.companyLogoUrl)}
                alt={config.companyName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
            <span className="font-headline font-bold text-xl hidden sm:inline-block">
              {config.companyName}
            </span>
          </Link>
          <div className="ml-10 hidden md:flex items-center gap-6">
            {config.navLinks?.map((link) => (
              <Link key={link.id} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Settings className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 bg-secondary rounded-full">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-6">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
