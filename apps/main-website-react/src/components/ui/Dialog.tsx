import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open: boolean;
  setOpen: (prevValue: boolean) => void;
  title?: string;
}
export default function Modal({
  children,
  open,
  setOpen,
  title,
  ...props
}: Props) {
  return (
    <Transition.Root show={open} as="div" {...props}>
      <Dialog as="div" className="relative z-[100000]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex w-screen h-screen items-center justify-center px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-y-scroll rounded-lg bg-white px-4 pb-4 text-left shadow-xl transition-all max-h-[calc(100vh-4rem)]">
                {/* <div className="absolute right-0 top-0 pr-3 pt-3 block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-red-600"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div> */}
                <div
                  className={cn(
                    'sticky top-0 bg-white z-10 py-5',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Dialog.Title
                      as="h3"
                      className={cn(
                        'text-2xl font-semibold leading-6 text-gray-900 pl-1',
                        { invisible: !title },
                      )}
                    >
                      {title}
                    </Dialog.Title>
                    <div className="block">
                      <div className="flex w-full h-full items-center">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-red-600"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div>{children}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
