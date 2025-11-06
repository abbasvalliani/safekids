'use client'
import React from 'react';
import {routes} from '../../routes/routes'
import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <div className="absolute bottom-[1.5rem] w-[100%] text-center">
        <div className="container-custom mx-auto">
          <div className="flex flex-wrap text-[#ffffff80] text-sm ">
            <div className="w-full md:w-5/12 md:text-left text-center">
              <Link href="/">
                <img
                  src="/images/logo-footer.svg"
                  className="mx-auto md:mx-0"
                  alt=""
                />
              </Link>
              <p className="text-lg leading-[22px] py-[1rem] font-normal">
                Our mission is to keep kids safe online. Safe Kids is developed
                by kids, mental health experts and supported by a world-class
                advisory team.
              </p>
              <div className="ml-[-0.7rem]">
                <a
                  href="mailto:support@safekids.ai"
                  className="text-sm font-medium leading-[19px] text-white no-underline px-[0.8rem]"
                >
                  Contact us
                </a>
                <span>|</span>
                <Link
                  href="privacy-policy"
                  className="text-sm font-medium leading-[19px] text-white no-underline px-[0.8rem]"
                >
                  Privacy
                </Link>
                <span>|</span>
                <Link
                  href="terms-and-conditions"
                  className="text-sm font-medium leading-[19px] text-white no-underline px-[0.8rem]"
                >
                  Terms &amp; Conditions
                </Link>
              </div>
            </div>
            <div className="md:w-2/12 w-full" />
            <div className="md:w-5/12 w-full flex flex-col justify-between md:text-right text-center">
              <div className="">
                { routes.map((route, index) => <Link href={route.href} className='text-sm font-medium leading-[19px] text-white no-underline px-[0.8rem]' key={index}>{route.name}</Link>)}

                {/*<a href="https://app.safekids.ai/signin" target="_blank" class="ml-4 text-sm font-medium leading-[19px] text-white no-underline px-[0.8rem]">Login</a>*/}
              </div>
              <div className="pt-[2rem] xl:pt-0">
                © 2025 Safe Kids LLC. All Rights Reserved.
                <span className="ml-2">Version: {process.env.NEXT_PUBLIC_GIT_TAG ?? 'unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
