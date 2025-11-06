import React from 'react';
import Carousel from '../../components/pages/products/Carousel';
import FadeInView from '../../components/ui/FadeInView';
import { gellix } from '../../components/fonts/gellix';

const Products = () => {
  return (
    <div id="contentWrapper">
      {/* Session Content Products 1 */}
      <section className="pt-[6rem] pb-[3rem] lg:pt-[10rem] pb-[5rem]">
        <div className="container-custom mx-auto">
          <div>
            <div className="text-center">
              <h1 className="text-[60px] sm:text-[90px] xl:text-[100px] leading-[100%] font-extrabold">
                Products
                <span className="check-point" />
              </h1>
              <h2 className="text-[38px] leading-[42px] py-[1rem] sm:text-[48px] sm:leading-[52px] font-extrabold font-gallix-extrabold">
                An added layer <span className="color2">of protection</span>
              </h2>
            </div>
            <div className="lg:w-8/12 w-full lg:mx-auto">
              <div className="sm:flex sm:items-center block">
                <img
                  className="w-[50%] sm:w-[40%] md:w-[28%] xl:w-[auto] mx-auto sm:mx-0"
                  src="/images/products/product-icon1.svg"
                  alt=""
                />
                <div>
                  <h2 className="text-[32px] text-center sm:text-left">
                    Most advanced AI powered filter that looks for{' '}
                    <span className="color2">intent </span>
                    and <span className="color2">re-inforces</span> positive
                    behavior in kids{' '}
                  </h2>
                </div>
              </div>
              <div className="pt-4">
                <iframe
                  frameBorder={0}
                  width="100%"
                  height={329}
                  className="embed-responsive-item"
                  src="https://youtube.com/embed/Zsp9J_WQe7k?rel-0"
                  allowFullScreen={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Session Content Products 2 */}
      <Carousel />
      {/* Session Content Products 3 */}
      <section>
        <div className="container-custom mx-auto">
          <div className="lg:w-8/12 w-full lg:mx-auto">
            <div className="sm:flex sm:items-center block">
              <img
                className="w-[50%] sm:w-[40%] md:w-[28%] xl:w-[auto] mx-auto sm:mx-0"
                src="/images/products/product-icon3.svg"
                alt=""
              />
              <div>
                <h2 className="text-[32px] text-center sm:text-left">
                  Most advanced AI powered email filter that helps kids identify{' '}
                  <span className="color2">bullying</span> for both incoming and
                  outgoing emails
                </h2>
              </div>
            </div>
            <div className="pt-4">
              <iframe
                frameBorder={0}
                width="100%"
                height={329}
                className="embed-responsive-item"
                src="https://youtube.com/embed/79Tw1E0h-cQ?rel-0"
                allowFullScreen={true}
              />
              <div className="pt-4">
                <iframe
                  frameBorder={0}
                  width="100%"
                  height={329}
                  className="embed-responsive-item"
                  src="https://youtube.com/embed/jVvqryUcj34?rel-0"
                  allowFullScreen={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Session Content Products 4 */}
      <section className="py-[6rem]">
        <div className="container-custom mx-auto">
          <div className="grid xl:grid-cols-2 gap-4">
            <div className="lg:max-xl:flex gap-4">
              <FadeInView className="mb-[2rem] lg:max-xl:w-1/2 xl:w-[100%] xl:pl-[6rem] px-[2rem] pt-[100px] pb-[3rem] relative bg-white border border-[#EEEEEE] shadow-2xl rounded-[20px] xl:text-left  text-center fade-bottom">
                <img
                  className="xl:w-[25%] absolute xl:top-[50%] xl:translate-y-[-50%] xl:left-[-72px] max-xl:top-[-100px] max-xl:left-[50%] max-xl:translate-x-[-50%]"
                  src="/images/products/product-icon2.svg"
                  alt=""
                />
                <p
                  className={`text-[#4BC58A] font-medium not-italic ${gellix.className} text-[20px] leading-[30px] mb-[1.5rem] sm:mb-[2rem] sm:px-[3rem] xl:px-[0] xl:text-[22px] min-[1920px]:text-[24px] min-[1920px]:leading-[35px]`}
                >
                  Contact us for help. We're available to listen and find
                  effective solutions to assist you. Let us know how we can
                  help.
                </p>
                <div className="border-btn-small3">
                  <a href="mailto:support@safekids.ai">
                    <button className="btn small3">
                      Talk To Us Now{' '}
                      <img
                        src="/images/icon-arrow-btn.svg"
                        className="bg-icon-btn inline"
                        alt=""
                      />
                    </button>
                  </a>
                </div>
              </FadeInView>
              <FadeInView className="lg:max-xl:w-1/2 xl:w-[100%] xl:pl-[6rem] px-[2rem] pt-[100px] pb-[3rem] relative bg-white border border-[#EEEEEE] shadow-2xl rounded-[20px] xl:text-left  text-center fade-bottom">
                <img
                  className="xl:w-[25%] absolute xl:top-[50%] xl:translate-y-[-50%] xl:left-[-72px] max-xl:top-[-100px] max-xl:left-[50%] max-xl:translate-x-[-50%]"
                  src="/images/products/product-icon3.svg"
                  alt=""
                />
                <p
                  className={`text-[#765FEF] font-medium not-italic ${gellix.className} text-[20px] leading-[30px] mb-[1.5rem] sm:mb-[2rem] sm:px-[3rem] xl:px-[0] xl:text-[22px] min-[1920px]:text-[24px] min-[1920px]:leading-[35px]`}
                >
                  Our email application is free for a limited time and helps
                  kids identify bullying for both incoming and outgoing emails.
                </p>
                <div className="border-btn-small4">
                  <a
                    href="https://chrome.google.com/webstore/detail/safe-kids-ai-for-email/pnaedlhkmadjdgjkenjmaepfaiiioocc"
                    target="_blank"
                  >
                    <button className="btn small4">
                      Get It On Chrome Store{' '}
                      <img
                        src="/images/icon-arrow-btn.svg"
                        className="bg-icon-btn inline"
                        alt=""
                      />
                    </button>
                  </a>
                </div>
              </FadeInView>
            </div>
            <div className="lg:max-xl:hidden">
              <img
                className="mx-auto"
                src="/images/products/img-products3.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
      {/* Session Content How It Works Privacy 5 */}
      <section id="session-content-how-it-works-privacy5">
        <div className="row"></div>
      </section>
      {/* Footer */}
    </div>
  );
};

export default Products;
