'use client';
import React, { useState } from 'react';
import FadeInView from '../../components/ui/FadeInView';
// import Modal from '../../components/ui/Dialog';
import VideoPlayer from '../../components/ui/VideoPlayer';

const HowItWorks = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div id="contentWrapper">
        {/* Banner */}
        <section className="pt-[7rem] xl:pt-[5rem]">
          <div className="container-custom mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="lg:w-5/12 md:w-6/12 w-full">
                <div>
                  <h1 className="text-[45px] leading-[40px] sm:text-[70px] sm:leading-[65px] md:text-[55px] md:leading-[50px] lg:text[65px] lg:leading-[60px] xl:text-[77px] xl:leading-[85%] min-[1920px]:text-[90px] min-[1920px]:leading-[100%]">
                    Other tools block{' '}
                    <span className="color2">based on keywords.</span>
                  </h1>
                  <p className="font-gt-walsheim-pro pb-[2rem] md:pl-[0] pt-[2rem] px-[1rem] xl:pr-[0] xl:pb-[1.5rem] xl:pl-[0px] text-[18px] leading-[24px] sm:text-[20px] sm:leading-[32px] md:text-[18px] md:leading-[30px] lg:text-[24px] lg:leading-[36px]">
                    Safe Kids smart scans website content, URLs, and more to
                    analyze intent because keywords {`aren't`} enough.
                  </p>
                </div>
              </div>
              <div className="lg:w-7/12 md:w-6/12 w-full">
                <img
                  src="/images/how-it-works-privacy/img-how-it-works-privacy-banner.png"
                  className="hidden md:block max-w-[120%]"
                  alt=""
                />
                <img
                  src="/images/how-it-works-privacy/mobile/img-how-it-works-privacy-banner-mobile.png"
                  className="md:hidden w-full "
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>
        {/* Session Content How It Works Privacy 1 */}
        <section className="py-[3rem] sm:py-[5rem]">
          <div className="container-custom mx-auto">
            <div className="flex flex-wrap">
              <div className="lg:w-2/12 w-full" />
              <FadeInView className="lg:w-8/12 w-full fade-bottom relative">
                <img
                  src="/images/how-it-works-privacy/how_it_works_play.png"
                  className="md:w-[auto] md:mx-auto w-full hover:cursor-pointer"
                  alt=""
                  onClick={() => setShowModal(true)}
                />
                <span className="absolute pulse-button md:top-[37%] md:left-[43%] top-[22%] left-[38%]">
                  <button onClick={() => setShowModal(true)}>
                    <img
                      src="/images/about-us/play.svg"
                      alt=""
                      className="w-[100px] md:w-[auto]"
                    />
                  </button>
                </span>
              </FadeInView>
              <div className="lg:w-2/12 w-full" />
            </div>
          </div>
        </section>
        {/* Session Content How It Works Privacy 2 */}
        <section className="py-[3rem] sm:py-[5rem]">
          <div className="container-custom mx-auto">
            <div className="flex flex-wrap">
              <div className="w-full text-center">
                <h2 className="font-gallix-extrabold text-[50px] leading-[40px] pt-[1rem] px-[1rem] sm:text-[60px] sm:leading-[50px] lg:pb-[9rem] pb-[6rem] xl:px-0  xl:text-[100px] xl:leading-[78px]">
                  Here’s how <span className="color2">it works</span>
                  <span className="check-point2" />
                </h2>
              </div>
              <FadeInView className="w-full md:w-4/12 fade-bottom mb-[6rem] md:mb-0 md:pr-[0.5rem]">
                <div className=" relative pt-[4.5rem] md:h-full md:px-[1.5rem] px-[2rem] xl:px-[2rem] pb-[2rem] text-center bg-white border border-[#EEEEEE] rounded-[20px] shadow-lg shadow-[0px 24px 27px rgba(0, 0, 0, 0.07)]">
                  <img
                    className="absolute top-[-73px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-1.svg"
                    alt=""
                  />
                  <h6 className="font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[45px] pb-[1rem]">
                    Choose What
                    <br />
                    Gets Blocked
                  </h6>
                  <p className="">
                    Set search and content limits so you choose what’s blocked.
                  </p>
                </div>
              </FadeInView>
              <FadeInView className="w-full md:w-4/12 fade-bottom mb-[6rem] md:mb-0 md:px-[0.5rem]">
                <div className="relative pt-[4.5rem] md:h-full px-[2rem] md:px-[1.5rem] xl:px-[2rem] pb-[2rem] text-center bg-white border border-[#EEEEEE] rounded-[20px] shadow-lg shadow-[0px 24px 27px rgba(0, 0, 0, 0.07)]">
                  <img
                    className="absolute top-[-73px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-2.svg"
                    alt=""
                  />
                  <h6 className="font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[45px] pb-[1rem]">
                    Intercepts Before
                    <br />
                    It’s Seen
                  </h6>
                  <p className="">
                    Safe Kids smart scans websites, URLs, and chats to intercept
                    negative content before it’s seen.
                  </p>
                </div>
              </FadeInView>
              <FadeInView className="w-full md:w-4/12 fade-bottom  md:mb-0 md:px-[0.5rem]">
                <div className="relative pt-[4.5rem] md:h-full px-[2rem] md:px-[1.5rem] xl:px-[2rem] pb-[2rem] text-center bg-white border border-[#EEEEEE] rounded-[20px] shadow-lg shadow-[0px 24px 27px rgba(0, 0, 0, 0.07)]">
                  <img
                    className="absolute top-[-73px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                    src="/images/how-it-works-privacy/icon-3.svg"
                    alt=""
                  />
                  <h6 className="font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[45px] pb-[1rem]">
                    Blocks Become Teachable Moments
                  </h6>
                  <p className="">
                    Blocks are turned into teachable moments to help kids be
                    safer on the Internet. Parents can see when blocks happen.
                  </p>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
        {/* Session Content How It Works Privacy 3 */}
        <section>
          <div className="container-custom mx-auto">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12">
                <img
                  src="/images/how-it-works-privacy/img-how-it-works-privacy.png"
                  className="hidden lg:block max-w-[140%] ml-[-10rem] lg:ml-[-12rem] xl:ml-[-14rem] 2xl:ml-[-18rem]"
                  alt=""
                />
              </div>
              <FadeInView className="w-full lg:w-6/12 fade-right">
                <h2 className="font-gallix-extrabold text-center lg:text-left text-[50px] leading-[40px] sm:lg:text-[60px] sm:lg:leading-[50px] md:text-[50px] md:leading-[45px] md:pt-[4rem] xl:pt-[10rem] xl:pr-[6rem] xl:pb-[3rem]  pb-[2rem]  xl:leading-[64px]">
                  All data is private <span className="color2">and safe.</span>
                </h2>
                <img
                  src="/images/how-it-works-privacy/img-how-it-works-privacy.png"
                  className="lg:hidden sm:ml-[-8rem] w-[105%] ml-[-2rem]"
                  alt=""
                />
                <div className="flex mb-[1.2rem] text-left">
                  <div className="lg:w-[60px] sm:w-[50px] w-[70px] mt-[8px]">
                    <div className="w-[20px] h-[20px] rounded-full bg-[#ff2f4e] " />
                  </div>
                  <div>
                    <p>
                      We only look at categories of search: we don’t track
                      specific websites.
                    </p>
                  </div>
                </div>
                <div className="flex mb-[1.2rem] text-left">
                  <div className="lg:w-[60px] sm:w-[50px] w-[70px] mt-[8px]">
                    <div className="w-[20px] h-[20px] rounded-full bg-[#ff2f4e] " />
                  </div>
                  <div>
                    <p>
                      Because we don’t track kids’ activities, search history is
                      not linked to each kid.
                    </p>
                  </div>
                </div>
                <div className="flex mb-[1.2rem] text-left">
                  <div className="lg:w-[60px] sm:w-[50px] w-[70px] mt-[8px]">
                    <div className="w-[20px] h-[20px] rounded-full bg-[#ff2f4e] " />
                  </div>
                  <div>
                    <p>
                      No browsing data is captured. We only track high level
                      search categories.
                    </p>
                  </div>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
        {/* Session Content How It Works Privacy 4 */}
        <section>
          <div className="container-custom mx-auto">
            <div className="flex flex-wrap">
              <div className="w-full text-center">
                <img className="mx-auto" src="/images/logo.svg" alt="" />
                <h2 className="font-gallix-extrabold text-[50px] leading-[40px] sm:lg:text-[60px] sm:lg:leading-[50px] sm:pb-[7rem] md:text-[50px] md:leading-[45px] pb-[6rem] xl:text-[48px] xl:leading-[52px] font-extrabold xl:px-[20rem]">
                  Built to catch more, earlier{' '}
                  <span className="color2">
                    and turn blocks into learning moments.
                  </span>
                </h2>
              </div>
              <FadeInView className="lg:w-6/12 w-full fade-bottom">
                <div className="px-[2rem] pb-[1rem] mb-[5rem] sm:mb-[6rem] lg:mb-[1rem] md:max-lg:min-h-[280px] lg:max-xl:min-h-[340px] xl:pt-[4rem] xl:pr-[4rem] min-[1920px]:pr-[6rem] xl:pb-[3rem] xl:pl-[6rem] min-[1920px]:mx-[4.5rem] 2xl:mx-[4rem] lg:mx-[2rem] text-center lg:text-left bg-white border border-[#EEEEEE] rounded-[20px] shadow-lg shadow-[0px 24px 27px rgba(0, 0, 0, 0.07)]">
                  <img
                    className="relative max-[430px]:w-1/2 max-[480px]:w-[40%] sm:lg:w-[30%] md:w-[20%] md:mt-[-7%] min-[0px]:mt-[-18%] min-[431px]:mt-[-14%] lg:mt-[-12%] max-xl:inline-block xl:absolute xl:mt-[9%] xl:ml-[-10.5rem] xl:w-[23%]"
                    src="/images/how-it-works-privacy/icon-check.svg"
                    alt=""
                  />
                  <h6 className="text-[25px] leading-[26px] sm:text-[35px] sm:leading-[36px] xl:text-[40px] xl:leading-[45px] xl:pb-[1rem] pb-[0.5rem] font-bold">
                    Patented Approach to Behavior Change
                  </h6>
                  <p className="mb-[1rem]">
                    Blocks are met with encouraging messages to help kids search
                    safer online.
                  </p>
                </div>
              </FadeInView>
              <FadeInView className="lg:w-6/12 w-full fade-bottom">
                <div className="px-[2rem] pb-[1rem] mb-[5rem] sm:mb-[6rem] lg:mb-[1rem] md:max-lg:min-h-[280px] lg:max-xl:min-h-[340px] xl:pt-[4rem] xl:pr-[4rem] min-[1920px]:pr-[6rem] xl:pb-[3rem] xl:pl-[6rem] min-[1920px]:mx-[4.5rem] 2xl:mx-[4rem] lg:mx-[2rem] text-center lg:text-left bg-white border border-[#EEEEEE] rounded-[20px] shadow-lg shadow-[0px 24px 27px rgba(0, 0, 0, 0.07)]">
                  <img
                    className="relative max-[430px]:w-1/2 max-[480px]:w-[40%] sm:lg:w-[30%] md:w-[20%] md:mt-[-7%] min-[0px]:mt-[-18%] min-[431px]:mt-[-14%] lg:mt-[-12%] max-xl:inline-block xl:absolute xl:mt-[9%] xl:ml-[-10.5rem] xl:w-[23%]"
                    src="/images/how-it-works-privacy/icon-check.svg"
                    alt=""
                  />
                  <h6 className="text-[25px] leading-[26px] sm:text-[35px] sm:leading-[36px] xl:text-[40px] xl:leading-[45px] xl:pb-[1rem] pb-[0.5rem] font-bold">
                    AI-based Smart Scan
                  </h6>
                  <p className="mb-[1rem]">
                    Safe Kids artificial intelligence uses sophisticated models
                    and pattern recognition to intercept content, other tools
                    traditionally miss.
                  </p>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
        {/* Session Content How It Works Privacy 5 */}
        <section id="session-content-how-it-works-privacy5">
          <div className="row"></div>
        </section>
        {/* Footer */}
      </div>
      <VideoPlayer videoSrc='https://www.youtube.com/embed/1KCg9eU9e68?autoplay=1' open={showModal} setOpen={setShowModal}/>
    </>
  );
};

export default HowItWorks;
