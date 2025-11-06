'use client';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { routes } from '../../routes/routes';
import $ from 'jquery';
import Sheet from '../ui/Sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../../lib/utils';
const Header = () => {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname()
  useEffect(() => {
    function onScroll() {
      const scrollTop = $(window).scrollTop() || 0;
      if (scrollTop > 1) {
        $(header.current!).addClass('mt-[-1px]');
      } else {
        $(header.current!).removeClass('mt-[-1px]').addClass('mt-0');
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <header ref={header} className="transition-all duration-1000 mt-0">
      <section className="navigation">
        <div className="container-custom mx-auto">
          <nav className="navbar py-[0.5rem]">
            <div className="container-custom mx-auto px-4 py-2 flex justify-between items-center">
              <Link href="/">
                <Image
                  src="/images/logo.svg"
                  alt=""
                  width={0}
                  height={0}
                  style={{ width: '100%', height: 'auto' }} // optional
                />
              </Link>
              <button
                id="haeder-menu-button"
                className="md:hidden text-center mx-auto mt-0 mb-[1rem] contents text-[#0000008c] border-[#0000001a] py-[0.25rem] px-[0.75rem] text-[1.25rem] leading-none bg-transparent border rounded-[0.25rem]"
                onClick={() => setOpen(!open)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"
                    fill="#222224"
                  />
                </svg>
              </button>
                <div className="items-center space-x-4 hidden md:flex">
                  {routes.map((route, i) => (
                    <Link
                      href={route.href}
                      className="text-gray-800 hover:text-red-600 font-medium px-3 py-2 rounded-md text-sm"
                      key={i}
                    >
                      {route.name}
                    </Link>
                  ))}
                </div>
            </div>
            <Sheet
                title={
                  <div onClick={() => {setOpen(false); router.push('/')}} className='hover:cursor-pointer'>
                    <Image
                      src="/images/logo.svg"
                      alt=""
                      width={0}
                      height={0}
                      style={{ width: '100%', height: 'auto' }} // optional
                    />
                  </div>
                }
                open={open}
                setOpen={setOpen}
              >
                <div
                  id="mobile-navigation"
                  className="text-left pb-8 overflow-y-auto top-full left-0 w-full"
                >
                  <ul className="space-y-1 px-4 py-2">
                    {routes.map((route, i) => (
                      <li key={i}>
                        <div
                          onClick={() => {setOpen(false); router.push(route.href)}}
                          className={cn("text-black hover:text-red-500 hover:cursor-pointer block px-3 py-2 rounded-md font-medium text-lg", {'text-red-600': route.href === pathname})}
                        >
                          {route.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
            </Sheet>
          </nav>
        </div>
      </section>
    </header>
  );
};

export default Header;
