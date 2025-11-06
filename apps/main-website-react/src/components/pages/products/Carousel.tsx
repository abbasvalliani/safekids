'use client';
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { cn } from '../../../lib/utils';
import { gellix } from '../../fonts/gellix';

const Carousel = () => {
  const [nav1, setNav1] = useState<Slider | undefined>();
  const [nav2, setNav2] = useState<Slider | undefined>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    console.log('current', currentSlide)
  }, [currentSlide])
  const navSettings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: false,
    centerMode: false,
    centerPadding: '0',
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          focusOnSelect: false,
          infinite: true
        },
      },
    ],
  };
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    autoplay: true,
    centerMode: false,
    autoplaySpeed: 3000,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
  };
  return (
    <section>
      <div className="container-custom mx-auto">
        <div>
          <div>
            <Slider
              asNavFor={nav2}
              ref={(slider1) => setNav1(slider1 === null ? undefined : slider1)}
              className="slider-session-content-products2-nav"
              {...navSettings}
            >
              <div
                data-index={0}
                className="slider-session-content-products2-nav-item"
              >
                <img
                  className={cn('mx-auto', {
                    'carousel-image': currentSlide === 0,
                  })}
                  src="/images/products/testimonial1.png"
                  alt=""
                />
              </div>
              <div
                data-index={0}
                className="slider-session-content-products2-nav-item"
              >
                <img
                  className={cn('mx-auto', {
                    'carousel-image': currentSlide === 1,
                  })}
                  src="/images/products/testimonial2.png"
                  alt=""
                />
              </div>
              <div
                data-index={0}
                className="slider-session-content-products2-nav-item"
              >
                <img
                  className={cn('mx-auto', {
                    'carousel-image': currentSlide === 2,
                  })}
                  src="/images/products/testimonial3.png"
                  alt=""
                />
              </div>
              <div
                data-index={1}
                className="slider-session-content-products2-nav-item"
              >
                <img
                  className={cn('mx-auto', {
                    'carousel-image': currentSlide === 3,
                  })}
                  src="/images/products/testimonial4.png"
                  alt=""
                />
              </div>
              <div
                data-index={2}
                className="slider-session-content-products2-nav-item"
              >
                <img
                  className={cn('mx-auto', {
                    'carousel-image': currentSlide === 4,
                  })}
                  src="/images/products/testimonial5.png"
                  alt=""
                />
              </div>
            </Slider>

            <Slider
              asNavFor={nav1}
              ref={(slider2) => setNav2(slider2 === null ? undefined : slider2)}
              {...settings}
              className="slider-session-content-products2"
            >
              <div>
                <div className={`lg:w-8/12 lg:mx-auto ${gellix.className} font-semibold text-[26px] py-[2rem] sm:text-[35px] xl:text-[50px] not-italic leading-[100%] text-center text-[#222224]`}>
                  Safe Kids blocks the bad stuff and allows the good stuff
                  through.
                </div>
                <div className={`${gellix.className} font-semibold not-italic text-center text-[24px] leading-[26px] text-[#FF2F4E] py-[0.5rem]`}>
                  Jenna – Irvine
                </div>
                <div className={`${gellix.className} text-center not-italic font-medium opacity-50 text-[#222224] text-lg leading-[22px] pb-[2rem]`}>
                  CA – Child: 12
                </div>
              </div>
              <div>
                <div className={`lg:w-8/12 lg:mx-auto ${gellix.className} font-semibold text-[26px] py-[2rem] sm:text-[35px] xl:text-[50px] not-italic leading-[100%] text-center text-[#222224]`}>
                  I don't fight with my parents anymore. They understand I am
                  responsible.
                </div>
                <div className={`${gellix.className} font-semibold not-italic text-center text-[24px] leading-[26px] text-[#FF2F4E] py-[0.5rem]`}>
                  Tom – San Francisco
                </div>
                <div className={`${gellix.className} text-center not-italic font-medium opacity-50 text-[#222224] text-lg leading-[22px] pb-[2rem]`}>
                  CA – Child: 11
                </div>
              </div>
              <div>
                <div className={`lg:w-8/12 lg:mx-auto ${gellix.className} font-semibold text-[26px] py-[2rem] sm:text-[35px] xl:text-[50px] not-italic leading-[100%] text-center text-[#222224]`}>
                  I now feel responsible to make good decisions and now my
                  parents trust me.
                </div>
                <div className={`${gellix.className} font-semibold not-italic text-center text-[24px] leading-[26px] text-[#FF2F4E] py-[0.5rem]`}>
                  James – Mclean
                </div>
                <div className={`${gellix.className} text-center not-italic font-medium opacity-50 text-[#222224] text-lg leading-[22px] pb-[2rem]`}>
                  VA – Child: 13
                </div>
              </div>
              <div>
                <div className={`lg:w-8/12 lg:mx-auto ${gellix.className} font-semibold text-[26px] py-[2rem] sm:text-[35px] xl:text-[50px] not-italic leading-[100%] text-center text-[#222224]`}>
                  I can now tell why some websites are not good and why I
                  shouldn't be on them.
                </div>
                <div className={`${gellix.className} font-semibold not-italic text-center text-[24px] leading-[26px] text-[#FF2F4E] py-[0.5rem]`}>
                  Emily – DC
                </div>
                <div className={`${gellix.className} text-center not-italic font-medium opacity-50 text-[#222224] text-lg leading-[22px] pb-[2rem]`}>
                  DC – Child: 9
                </div>
              </div>
              <div>
                <div className={`lg:w-8/12 lg:mx-auto ${gellix.className} font-semibold text-[26px] py-[2rem] sm:text-[35px] xl:text-[50px] not-italic leading-[100%] text-center text-[#222224]`}>
                  I feel quite safe when I am using the browser.
                </div>
                <div className={`${gellix.className} font-semibold not-italic text-center text-[24px] leading-[26px] text-[#FF2F4E] py-[0.5rem]`}>
                  Musa – Texas
                </div>
                <div className={`${gellix.className} text-center not-italic font-medium opacity-50 text-[#222224] text-lg leading-[22px] pb-[2rem]`}>
                  CA – Child: 10
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel;