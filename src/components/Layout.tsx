"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Wrench, Users, ClipboardList, Clock, Package, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

const Layout = ({ children }) => {
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Service Orders', icon: Wrench, path: '/service-orders' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Activities', icon: ClipboardList, path: '/activities' },
    { name: 'Time Entries', icon: Clock, path: '/time-entries' },
    { name: 'Equipments', icon: Package, path: '/equipments' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-md p-4">
        <div className="text-2xl font-bold text-blue-600 mb-8">ServiceApp</div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <Button onClick={signOut} className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Top bar for smaller screens */}
        <header className="md:hidden flex items-center justify-between bg-white shadow-sm p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Home className="w-6 h-6" /> {/* Using Home icon as a generic menu icon */}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="text-2xl font-bold text-blue-600 mb-8">ServiceApp</div>
              <nav className="flex-grow">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className="flex items-center p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto">
                <Button onClick={signOut} className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="text-xl font-bold text-blue-600">ServiceApp</div>
          <div></div> {/* Placeholder for balance */}
        </header>

        <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-[#e8d3d6]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;