import React from 'react';
import FadeInView from '../../components/ui/FadeInView';

const Patents = () => {
  return (
    <div id="contentWrapper">
      {/* Banner */}
      <section className="pt-[7rem] xl:pt-[5rem]">
        <div className="container-custom mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="lg:w-5/12 md:w-6/12 w-full">
              <div>
                <h1 className="text-[45px] leading-[40px] sm:text-[70px] sm:leading-[65px] md:text-[55px] md:leading-[50px] lg:text[65px] lg:leading-[60px] xl:text-[80px] xl:leading-[85%] min-[1920px]:text-[90px] min-[1920px]:leading-[100%]">
                  Revolutionary <span className="color2">Patents </span>
                  and
                  <span className="color2"> Research</span>
                </h1>
                <p className="font-gt-walsheim-pro pb-[2rem] pt-[2rem] px-[1rem] xl:pr-[0] xl:pb-[1.5rem] xl:pl-[0px] text-[18px] leading-[24px] sm:text-[20px] sm:leading-[32px] md:text-[18px] md:leading-[30px] lg:text-[24px] lg:leading-[36px]">
                  Safe Kids is the only Company that has patents that cover
                  educating kids around internet use.
                </p>
              </div>
            </div>
            <div className="lg:w-7/12 md:w-6/12 w-full">
              <img
                src="/images/how-it-works-privacy/img-how-it-works-privacy-banner.png"
                className="hidden lg:block max-w-[120%]"
                alt=""
              />
              <img
                src="/images/how-it-works-privacy/mobile/img-how-it-works-privacy-banner-mobile.png"
                className="lg:hidden w-full"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container-custom mx-auto">
          <h2 className="font-extrabold font-gallix-extrabold text-center text-[50px] leading-[40px] sm:text-[60px] sm:leading-[50px] xl:text-[100px] xl:leading-[78px] xl:pb-[8rem] px-[1.5rem] pb-[6rem]">
            See our <span className="color2">Patents</span>
            <span className="check-point2" />
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FadeInView className="text-center fade-bottom">
              <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                <img
                  className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                  src="/images/how-it-works-privacy/icon-1.svg"
                  alt=""
                />
                <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                  In-the-moment Education
                </h6>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="/docs/patents/11356734.pdf">
                    <i>#11,356,734</i> - Methods and systems for counseling a
                    user with respect to supervised content
                  </a>
                </p>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="/docs/patents/11991415.pdf">
                    <i>#11,991,415</i> - Methods and systems for counseling a
                    user with respect to supervised content
                  </a>
                </p>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a
                    target="_blank"
                    href="https://patents.google.com/patent/US20230328331A1/en?q=(%22Safe+Kids+LLC%22)&oq=%22Safe+Kids+LLC%22"
                  >
                    Part 1 - Methods and systems for counseling a user with
                    respect to identified content
                  </a>
                </p>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a
                    target="_blank"
                    href="https://patents.google.com/patent/US20230328332A1/en?q=(%22Safe+Kids+LLC%22)&oq=%22Safe+Kids+LLC%22"
                  >
                    Part 2 - Methods and systems for counseling a user with
                    respect to identified content
                  </a>
                </p>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                <img
                  className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                  src="/images/how-it-works-privacy/icon-2.svg"
                  alt=""
                />
                <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                  Intent-detection
                  <br />
                  AI
                </h6>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="/docs/patents/12153939.pdf">
                    <i>#12,153,939</i> - Methods and systems for supervising
                    displayed content
                  </a>
                </p>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="/docs/patents/10949774.pdf">
                    <i>#10,949,774</i> - Methods and systems for supervising
                    displayed content
                  </a>
                </p>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a
                    target="_blank"
                    href="https://patents.google.com/patent/US20230153365A1/en?q=(%22Safe+Kids+LLC%22)&oq=%22Safe+Kids+LLC%22"
                  >
                    Methods and systems for determining user intents and
                    sentiments
                  </a>
                </p>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                <img
                  className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                  src="/images/how-it-works-privacy/icon-3.svg"
                  alt=""
                />
                <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                  Changing Behavior
                </h6>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="/docs/patents/11309086.pdf">
                    <i>#11,309,086</i> - Methods and systems for interactively
                    counseling a user with respect to supervised content
                  </a>
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
      <section>
        <div className="container-custom mx-auto">
          <h2 className="font-extrabold font-gallix-extrabold text-center text-[50px] leading-[40px] sm:text-[60px] sm:leading-[50px] xl:text-[100px] xl:leading-[78px] xl:pb-[8rem] px-[1.5rem] pb-[6rem]">
            See our <span className="color2">Research</span>
            <span className="check-point2" />
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FadeInView className="text-center fade-bottom">
              <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                <img
                  className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                  src="/images/how-it-works-privacy/icon-1.svg"
                  alt=""
                />
                <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                  Pause, Reflect and Redirect
                </h6>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="docs/prr.pdf">
                    Pause, Reflect, &amp; Redirect: A novel approach for
                    empowering kids to be safer online by helping them make
                    better decisions
                  </a>
                </p>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div className="px-[2rem] pt-[5rem] pb-[1.5rem] relative shadow-2xl bg-white border border-[#EEEEEE] rounded-[20px] mb-[5rem]">
                <img
                  className="absolute top-[-76px] left-[50%] translate-x-[-50%] w-[150px] h-[150px]"
                  src="/images/how-it-works-privacy/icon-2.svg"
                  alt=""
                />
                <h6 className="pb-[1.5rem] font-bold text-[30px] leading-[30px] sm:text-[40px] sm:leading-[40px] md:text-[25px] md:leading-[25px] xl:text-[40px] xl:leading-[40px]">
                  Intent Based AI
                </h6>
                <p className="text-[#0d6efd] mb-[1rem] text-lg">
                  <a target="_blank" href="docs/ai.pdf">
                    Safe Kids AI’s Natural Language Processing (NLP) and
                    Computer Vision (CV) Technology
                  </a>
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
      <section id="session-content-how-it-works-privacy5">
        <div className="row"></div>
      </section>
    </div>
  );
};

export default Patents;
