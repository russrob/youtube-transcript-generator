"use client";

import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './button';

export function AppHeader() {
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = isSignedIn ? [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Studio', href: '/studio' },
    { name: 'Scripts', href: '/scripts' },
    { name: 'Subscription', href: '/subscription' },
  ] : [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Demo', href: '/studio' },
  ];

  return (
    <header className="bg-white border-b border-sketch-border sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-sketch-content mx-auto px-sketch-6">
        <div className="flex justify-between items-center py-sketch-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={isSignedIn ? "/dashboard" : "/"} className="flex items-center space-x-sketch-3 hover:opacity-80 transition-opacity">
              <div className="bg-sketch-accent text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-sketch-text tracking-sketch-tight">ScriptForge AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-sketch-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sketch-text-muted hover:text-sketch-text transition-colors font-medium text-sketch-body hover:underline decoration-sketch-accent decoration-2 underline-offset-4"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-sketch-4">
            {isSignedIn ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-sketch-4">
                <Link 
                  href="/sign-in" 
                  className="text-sketch-text-muted hover:text-sketch-text transition-colors font-medium"
                >
                  Sign in
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-sketch-accent text-white px-sketch-6 py-sketch-3 rounded-xl hover:bg-sketch-accent-600 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-sketch-2">
            {isSignedIn && (
              <UserMenu />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-sketch-2 text-sketch-text hover:bg-sketch-surface"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sketch-border py-sketch-4 bg-sketch-surface/50">
            <nav className="flex flex-col space-y-sketch-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sketch-text-muted hover:text-sketch-text transition-colors font-medium px-sketch-2 py-sketch-2 rounded-sketch-sm hover:bg-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!isSignedIn && (
                <>
                  <div className="border-t border-sketch-border pt-sketch-3 mt-sketch-3 space-y-sketch-2">
                    <Link 
                      href="/sign-in" 
                      className="block text-sketch-text-muted hover:text-sketch-text transition-colors px-sketch-2 py-sketch-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/sign-up"
                      className="block bg-sketch-accent text-white px-sketch-4 py-sketch-3 rounded-xl hover:bg-sketch-accent-600 transition-colors text-center font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}