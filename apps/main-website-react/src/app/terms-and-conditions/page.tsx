import Link from 'next/link';
import React from 'react';

const Terms = () => {
  return (
    <div id="contentWrapper">
      <main className="md:pt-[10rem] pt-[6rem]">
        <section>
          <div className="container-custom mx-auto">
            <h2 className="session-content-terms-and-conditions text-center">
              Terms and <span className="color2">Conditions</span>
            </h2>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                  <img
                    className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-1.svg"
                    alt=""
                  />
                  <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                    Terms of Service for Schools
                  </h6>
                  <div className="relative mt-[10%]">
                    <Link href="/terms-of-service-for-schools">
                      <button className="btn small2">
                        Read More{' '}
                        <img
                          src="/images/icon-arrow-btn.svg"
                          className="inline pl-[1rem] pr-[0.5rem]"
                          alt=""
                        />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                  <img
                    className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-2.svg"
                    alt=""
                  />
                  <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                    Terms of Service for Parents and Legal Guardians
                  </h6>
                  <div className="relative mt-[10%]">
                    <Link href="/terms-of-service-for-parents-and-legal-guardians">
                      <button className="btn small2">
                        Read More{' '}
                        <img
                          src="/images/icon-arrow-btn.svg"
                          className="inline pl-[1rem] pr-[0.5rem]"
                          alt=""
                        />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                  <img
                    className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-3.svg"
                    alt=""
                  />
                  <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                    Privacy Policy
                  </h6>
                  <div className="relative mt-[10%]">
                    <Link href="/privacy-policy">
                      <button className="btn small2">
                        Read More{' '}
                        <img
                          src="/images/icon-arrow-btn.svg"
                          className="inline pl-[1rem] pr-[0.5rem]"
                          alt=""
                        />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Session Content How It Works Privacy 5 */}
      <section id="session-content-how-it-works-privacy5">
        <div className="row"></div>
      </section>
      {/* Footer */}
    </div>
  );
};

export default Terms;
