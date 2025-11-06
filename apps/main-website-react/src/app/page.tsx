import React from 'react';
import Banner from '../components/pages/home/Banner';
import SessionContentHome1 from '../components/pages/home/SessionContentHome1';
import FadeInView from '../components/ui/FadeInView';

const Home = () => {
  return (
    <>
      {/* Banner */}
      <Banner />
      {/* Session Content Home 1 */}
      <SessionContentHome1 />
      {/* Session Content Home 2 */}
      <section className="py-[3rem] text-center">
        <div className="container-custom mx-auto ">
          <div className="flex flex-wrap justify-center items-center">
            <div className="w-full lg:w-12/12">
              <img className="logo mx-auto mb-4" src="/images/logo.svg" alt="" />
              <h2 className="font-gallix-extrabold text-[28px] sm:text-4xl sm:leading-10 xl:text-5xl xl:leading-[52px] xl:pr-[15rem] xl:pb-[4rem] xl:pl-[15rem] leading-8 font-extrabold pb-[1rem]">
                AI smart scans websites,
                <span className="color2">
                  not just keywords, to intercept accidental clicks and shocking
                  searches.
                </span>
              </h2>
            </div>
            <FadeInView className="w-full lg:w-4/12 fade-left">
              <img
                src="/images/go.svg"
                className="w-[70%] sm:w-[50%] md:w-[35%] lg:[w-45%] xl:w-[50%] xl:pt-[4rem] min-[1920px]:w-[100%] mx-auto"
                alt=""
              />
              <h4 className="font-bold text-[28px] leading-[38px] text-[#4dcc8f]">
                Safe Kids approved
              </h4>
              <p className="relative xl:pt-[1rem] min-[1920]:pt-[3rem]">
                whitehouse.gov <br />
                <span className="py-[0.3rem] px-[0.8rem] inline-block text-[85%] text-white rounded-md bg-[#4DCC8F]">
                  is a government website
                </span>
              </p>
            </FadeInView>
            <div className="w-full lg:w-4/12">
              <img
                src="/images/img2.png"
                className="sm:w-[70%] md:w-[100%] mx-auto"
                alt=""
              />
            </div>
            <FadeInView className="w-full lg:w-4/12 fade-right">
              <img
                src="/images/stop.svg"
                className="w-[70%] sm:w-[50%] md:w-[35%] lg:[w-45%] xl:w-[50%] xl:pt-[4rem] min-[1920px]:w-[100%] mx-auto"
                alt=""
              />
              <h4 className="font-bold text-[28px] leading-[38px] text-[#ff2f4e]">
                Safe Kids blocked
              </h4>
              <p className="relative xl:pt-[1rem] min-[1920]:pt-[3rem]">
                whitehouse.com <br />{' '}
                <span className="py-[0.3rem] px-[0.8rem] inline-block text-[85%] text-white rounded-md bg-[#ff2f4e]">
                  used to be an adult website
                </span>
              </p>
            </FadeInView>
          </div>
        </div>
      </section>
      {/* Session Content Home 3 */}
      <section className="py-[3rem] lg:py-[5rem] xl:py-[4rem] ">
        <div className="container-custom mx-auto">
          <div className="flex flex-wrap justify-center items-center">
            <FadeInView className="w-full lg:w-5/12 fade-left">
              <h2 className="font-gallix-extrabold text-[28px] text-center lg:text-left sm:text-4xl sm:leading-10 xl:text-5xl xl:leading-[52px] leading-8 font-extrabold">
                Safe Kids AI smart scans desktop chat,
                <span className="color2">
                  like Discord and in-game chats,to intercept bullying and
                  grooming red flags.
                </span>
              </h2>
            </FadeInView>
            <div className="w-full px-3 lg:px-0 lg:w-7/12 relative">
              <img
                src="/images/mobile/img3-1.png"
                className="lg:hidden mx-auto"
                alt=""
              />
              <div className="float-box-outside bg-transparent shadow-lg border border-[#eeeeee] shadow-[rgba(0, 0, 0, 0.07)] bg-[#fffffff0] rounded-[20px] z-[9] w-[90%] sm:max-lg:w-[60%] sm:max-lg:mx-auto text-left mb-[1rem] min-h-[130px] lg:min-h-[0] relative lg:absolute lg:top-[0] lg:left-[0] lg:w-[350px] lg:mb-[0] xl:w-[345px]">
                <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px]">
                  <img
                    src="/images/icon-stop.svg"
                    className="mt-[-0.4rem] ml-[-3.5rem] absolute"
                    alt=""
                  />
                  <p className="text-lg sm:text-[22px] sm:pl-[4.5rem] xl:text-[24px]  pl-[5rem] non-italic font-semibold leading-7">
                    Someone tells your child they are worthless and should be
                    dead.
                  </p>
                </div>
              </div>
              <img
                src="/images/mobile/img3-2.png"
                className="lg:hidden mx-auto"
                alt=""
              />
              <div className="float-box-outside bg-transparent shadow-lg border border-[#eeeeee] bg-[#fffffff0] shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9] w-[90%] sm:max-lg:w-[60%] sm:max-lg:mx-auto text-left mb-[1rem] min-h-[130px] lg:min-h-[0] relative lg:absolute lg:bottom-[0] lg:left-[150px] lg:w-[350px] lg:mb-[0] xl:w-[345px]">
                <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px]">
                  <img
                    src="/images/icon-check.svg"
                    className="mt-[-0.4rem] ml-[-3.5rem] absolute"
                    alt=""
                  />
                  <p className="text-lg sm:text-[22px] sm:pl-[4.5rem] xl:text-[24px]  pl-[5rem] non-italic font-semibold leading-7">
                    Child jokes with friends about laughing to death.
                  </p>
                </div>
              </div>
              <img src="/images/img3.png" className="hidden lg:block" alt="" />
            </div>
          </div>
        </div>
      </section>
      {/* Session Content Home 4 */}
      <section className="py-[3rem] lg:pt-[5rem] lg:pb-0 xl:pt-[4rem] xl:pb-[1rem]">
        <div className="container-custom mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-6/12 hidden lg:block relative">
              <div className="float-box-outside absolute top-[-100px] left-[0] w-[295px] bg-transparent shadow-lg shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9]">
                <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                  <img
                    src="/images/icon-check.svg"
                    className="mt-[-0.4rem] ml-[-5.5rem] absolute"
                    alt=""
                  />
                  <p className="pl-[3rem] non-italic font-semibold text-[24px] leading-[28px] m-0">
                    Child searches for civil war guns for school project.
                  </p>
                </div>
              </div>
              <div className="float-box-outside absolute bottom-[0] left-[45%] w-[255px] bg-transparent shadow-lg shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9]">
                <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                  <img
                    src="/images/icon-stop.svg"
                    className="mt-[-0.4rem] ml-[-5.5rem] absolute"
                    alt=""
                  />
                  <p className="pl-[3rem] non-italic font-semibold text-[24px] leading-[28px] m-0">
                    Child searches for automatic rifles.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12">
                  <div className="scan-wrapper relative inline-block">
                    <img
                      src="/images/img4-1-no-scan.png"
                      className="scan__image"
                      alt=""
                    />
                    <div className="scan-overlay" />
                  </div>
                </div>
                <div className="w-full lg:w-6/12">
                  <div className="blocked-image-wrapper" id="blocked-image" />
                </div>
              </div>
            </div>
            <FadeInView className="w-full lg:w-6/12 fade-right">
              <h2 className="text-center lg:text-left font-gallix-extrabold text-[28px] leading-[32px] sm:text-[38px] xl:text-[48px] xl:leading-[52px] sm:leading-[42px] md:pb-[2rem] xl:pr-[5rem] xl:pb-[0] lg:pl-[5rem] xl:pl-[3rem] 2xl:pr-[2rem] 2xl:pb-[0] 2xl:pl-[3rem]  min-[1920px]:pr-[5rem] min-[1920px]:pl-[5rem]  pb-[2rem] font-extrabold">
                Safe Kids AI smart scans URLS and website content,
                <span className="color2">
                  {' '} not just keywords, to intercept inappropriate content before
                  it’s seen.
                </span>
              </h2>
            </FadeInView>
            {/* SLIDER */}
            <div className="lg:hidden text-center mx-auto">
              <div className="slider-session-content-home4">
                <div className="w-full">
                  <div className="scan-wrapper inline-block relative">
                    <img
                      src="/images/img4-1-no-scan.png"
                      className="scan__image"
                      alt=""
                    />
                    <div className="scan-overlay" />
                  </div>
                  <div className="float-box-outside w-[90%] relative text-left mb-[1rem] shadow-[none] min-h-[130px] bg-transparent rounded-[20px] z-[9]  md:max-w-[350px] mx-auto">
                    <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE] min-h-[130px]">
                      <img
                        src="/images/icon-check.svg"
                        className="absolute mt-[-0.4rem] ml-[-3.5rem]"
                        alt=""
                      />
                      <p className="text-[20px] min-[415px]:text-[24px] leading-[28px] pl-[5rem] sm:text-lg sm:pl-[4.5rem] no-italic font-semibold">
                        Child searches for civil war guns for school project.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="blocked-image-wrapper" id="blocked-image" />
                  <div className="float-box-outside w-[90%] relative text-left  mb-[1rem] shadow-[none] min-h-[130px] bg-transparent rounded-[20px] z-[9]  md:max-w-[350px] mx-auto">
                    <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE] min-h-[130px]">
                      <img
                        src="/images/icon-stop.svg"
                        className="absolute mt-[-0.4rem] ml-[-3.5rem]"
                        alt=""
                      />
                      <p className="text-[20px] min-[415px]:text-[24px] leading-[28px] pl-[5rem] sm:text-lg sm:pl-[4.5rem] no-italic font-semibold">
                        Child searches for automatic rifles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* SLIDER */}
          </div>
        </div>
      </section>
      {/* Session Content Home 5 */}
      <section
        id="session-content-home5"
        className="pt-[8rem] sm:pt-[12rem] md:pt-[20rem] xl:pt-[17rem] 2xl:pt-[21rem] min-[1920px]:pt-[25rem] md:pb[10rem] lg:pb-[6rem] xl:pb-0 2xl:pb-[2rem] min-[1920px]:pb-0 pb-[20rem] bg-no-repeat"
      >
        <div className="container-custom mx-auto py-8">
          <div className="flex flex-wrap">
            <div className="w-full">
              <h2 className="font-gallix-extrabold px-[1.5rem] sm:px-[3rem] text-[28px] leading-[32px] pb-[2rem] sm:text-[38px] sm:leading-[42px] xl:text-[48px] xl:leading-[52px] xl:pt-0 xl:pr-[10rem] xl:pb-[4rem] xl:pl-[10rem] min-[1920px]:pr-[15rem] min-[1920px]:pl-[15rem] text-center text-white font-extrabold">
                Safe Kids is password-protected so even the most tech-savvy kids
                {` can’t`} remove it.
              </h2>
            </div>
            <FadeInView className="w-full lg:w-4/12 px-4 mb-8 md:mb-0 column-tab-left fade-left">
              <div className="flex py-[1rem] px-[1rem] text-left bg-white shadow-lg rounded-[20px] lg:w-[140%]">
                <div className="mr-4">
                  <img src="/images/icon1.svg" className="" alt="" />
                </div>
                <div>
                  <p className="">
                    <b>Chrome Extension</b>
                  </p>
                  <p className="">
                    Kids can’t remove it.
                    <br />
                    Parents can toggle it off.
                  </p>
                </div>
              </div>
              <div className="space h-8" />
              <div className="flex py-[1rem] px-[1rem] text-left bg-white shadow-lg rounded-[20px] lg:w-[140%]">
                <div className="mr-4">
                  <img src="/images/icon2.svg" className="" alt="" />
                </div>
                <div>
                  <p className="">
                    <b>Outline custom limits so Safe Kids</b>
                  </p>
                  <p className="">blocks what you’d like</p>
                </div>
              </div>
              <div className="space h-8" />
              <div className="flex py-[1rem] px-[1rem] text-left bg-white shadow-lg rounded-[20px] lg:w-[140%]">
                <div className="mr-4">
                  <img src="/images/icon3.svg" className="" alt="" />
                </div>
                <div>
                  <p className="">
                    <b>Get notifications of blocks</b>
                  </p>
                  <p className="">Select how often you’re notified</p>
                </div>
              </div>
              <div className="space h-8" />
              <div className="flex py-[1rem] px-[1rem] text-left bg-white shadow-lg rounded-[20px] lg:w-[140%]">
                <div className="mr-4">
                  <img src="/images/icon4.svg" className="" alt="" />
                </div>
                <div>
                  <p className="">
                    <b>Patented approach to behavior change</b>
                  </p>
                  <p className="">teaches kids to make better choices.</p>
                </div>
              </div>
            </FadeInView>
            <div className="w-full lg:w-8/12 px-4 mb-8 md:mb-0">
              <img
                src="/images/img5.png"
                className="lg:w-[110%] xl:w-[100%] xl:relative xl:right-[-5rem] z-[0] 2xl:right-[-20rem] 2xl:pt-[2rem]"
                alt=""
              />
            </div>
          </div>
        </div>
        <div
          id="session-content-home6"
          className="container-custom mx-auto py-8"
        >
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-6/12">
              <h2 className="font-gallix-extrabold mb-[1rem] text-[50px] leading-[40px] md:text-[80px] md:leading-[70px] lg:text-[70px] lg:leading-[60px] xl:text-[106px] xl:leading-[100px] min-[1920px]:text-[120px] min-[1920px]:leading-[120px] font-extrabold">
                Safe Kids AI identifies
              </h2>
              <p className="font-gallix-extrabold text-[28px] leading-[32px] py-[1rem] px-[1.5rem] font-extrabold md:text-[38px] md:leading-[42px] md:px-0 md:py-0 xl:text-[48px] xl:leading-[52px]">
                intent-based behavior to catch red flag searches before other
                platforms might.
              </p>
            </div>
            
              <FadeInView className="w-full lg:w-6/12 fade-right">
                <img
                  src="/images/img6.png"
                  className="sm:right-[-7rem] md:right-[-2rem] lg:right-[-9rem] lg:w-[110%] lg:pt-[3rem] xl:right-[-5rem] xl:w-[100%] 2xl:right-[-20rem] min-[1920px]:right-[5rem] min-[1920px]:pt-[0] right-[-20px] relative"
                  alt=""
                />
              </FadeInView>
          </div>
        </div>
      </section>
      {/* Footer */}
    </>
  );
};

export default Home;
