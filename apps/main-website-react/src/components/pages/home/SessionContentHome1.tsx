import React from 'react';
import FadeInView from '../../ui/FadeInView';

const SessionContentHome1 = () => {
  return (
    <section className="py-12 lg:pb-[10rem] xl:pb-12">
      <div className="container-custom mx-auto">
        <div className="flex flex-wrap">
          <div className="lg:w-7/12 col-span-7 hidden lg:block relative">
            <div className="float-box-outside absolute xl:top-[-7%] top-[-17%] left-[40%] w-[345px] bg-transparent shadow-lg shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session1.png"
                  className="mt-[-0.4rem] ml-[-5.5rem] absolute"
                  alt=""
                />
                <p className="pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>Is this really the best thing for you to be doing?</b>
                </p>
                <p className="pt-[0.5rem] pl-[3rem] font-bold text-sm leading-[19px]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
            <div className="float-box-outside absolute top-[20%] left-[5%] w-[345px] bg-transparent shadow-lg shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session2.png"
                  className="mt-[-0.4rem] ml-[-5.5rem] absolute"
                  alt=""
                />
                <p className="pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>{`It's`} normal to learn about grown up stuff. </b>
                  <br />
                  <br />
                  Did you know that stuff like this is often made by hurting
                  women and children?
                  <br />
                </p>
                <p className="pt-[0.5rem] pl-[3rem] font-bold text-sm leading-[19px]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
            <div className="float-box-outside absolute 2xl:top-[68%] xl:top-[63%] top-[82%] left-[5%] w-[345px] bg-transparent shadow-lg shadow-[rgba(0, 0, 0, 0.07)] rounded-[20px] z-[9]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session3.png"
                  className="mt-[-0.4rem] ml-[-5.5rem] absolute"
                  alt=""
                />
                <p className="pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>We all end up clicking on things {`we shouldn't.`}</b>
                  <br />
                  <br />
                  Did you know that spending less time in front of a screen may
                  help you sleep better?
                  <br />
                </p>
                <p className="pt-[0.5rem] pl-[3rem] font-bold text-sm leading-[19px]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
            <img src="/images/img1.png" className="" alt="" />
          </div>
          <div className="lg:w-5/12 col-span-5">
            <FadeInView className="fade-right">
              <div className="text-center lg:text-left">
                <h2 className="font-gallix-extrabold xl:pt-[0] xl:pb-[0] xl:pr-[5rem] xl:pl-[0] pt-[1rem] pb-[1rem] pr-[1.5rem] pl-[1.5rem] min-[1920px]:text-[100px] min-[1920px]:leading-[78px] xl:text-[78px] xl:leading-[68px] sm:text-[60px] sm:leading-[50px] text-[50px] leading-[40px] font-extrabold">
                  Safe Kids is the Internet on training wheels
                  <span className="check-point" />
                </h2>
                <p className="py-[1rem] px-[1rem] text-lg leading-[26px] mb-[0.5rem] xl:text-2xl xl:leading-9 xl:py-[2rem] xl:pr-[14rem] xl:pl-[0]">
                  Safe Kids artificial intelligence uses sophisticated models to
                  intercept content other tools traditionally miss.
                </p>
                <img src="/images/img1.png" className="block lg:hidden" alt="" />
              </div>
            </FadeInView>
          </div>
          <div className="lg:hidden w-full px-3">
            <div className="float-box-outside w-[100%] text-left mb-[1rem] min-h-[130px]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session1.png"
                  className="mt-[-0.4rem] ml-[-3.5rem] absolute"
                  alt=""
                />
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>Is this really the best thing for you to be doing?</b>
                </p>
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] pt-[1rem] xl:pt-[0.5rem]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
            <div className="float-box-outside w-[100%] text-left mb-[1rem] min-h-[130px]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session2.png"
                  className="mt-[-0.4rem] ml-[-3.5rem] absolute"
                  alt=""
                />
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>{`It's`} normal to learn about grown up stuff. </b>
                  <br />
                  <br />
                  Did you know that stuff like this is often made by hurting
                  women and children?
                  <br />
                </p>
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] pt-[1rem] xl:pt-[0.5rem]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
            <div className="float-box-outside w-[100%] text-left mb-[1rem] min-h-[130px]">
              <div className="py-[1.5rem] px-[1rem] bg-[#fffffff0] rounded-[20px] border border-[#EEEEEE]">
                <img
                  src="/images/icon-session3.png"
                  className="mt-[-0.4rem] ml-[-3.5rem] absolute"
                  alt=""
                />
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] non-italic font-semibold text-lg leading-7 m-0">
                  <b>We all end up clicking on things we {`shouldn't`}.</b>
                  <br />
                  <br />
                  Did you know that spending less time in front of a screen may
                  help you sleep better?
                  <br />
                </p>
                <p className="pl-[5rem] sm:pl-[4.5rem] xl:pl-[3rem] pt-[1rem] xl:pt-[0.5rem]">
                  <a href="#" className="text-[red]">
                    Tell me more...
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionContentHome1;
