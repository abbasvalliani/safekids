'use client';

import React, { useState } from 'react';
// import $ from 'jquery';
import FadeInView from '../../components/ui/FadeInView';
import Modal from '../../components/ui/Dialog';
import VideoPlayer from '../../components/ui/VideoPlayer';
const About = () => {
  const [showModals, setShowModals] = useState({
    videoModal: false,
    aahilBio: false,
    zohranBio: false,
    advisor1: false,
    advisor2: false,
    advisor3: false,
    advisor4: false,
    advisor5: false,
    advisor6: false,
  });
  // useEffect(() => {
  //   $(document).ready(function () {
  //     const videoSrc = ($('#video1')[0] as HTMLVideoElement).src;

  //     // Show modal when button is clicked
  //     $('#showModalButton2').click(function () {
  //       $('#myModal2').removeClass('hidden');
  //       $('html, body').addClass('no-scroll');
  //       ($('#video1')[0] as HTMLVideoElement).src = videoSrc + '?autoplay=1'; // Start the video
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideModalButton').click(function () {
  //       $('#myModal2').addClass('hidden');
  //       $('html, body').removeClass('no-scroll');
  //       ($('#video1')[0] as HTMLVideoElement).src = ''; // Stop the video
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAahilBio').click(function () {
  //       $('#AahilBio').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAahilBio').click(function () {
  //       $('#AahilBio').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //     $('#showZohranBio').click(function () {
  //       $('#ZohranBio').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideZohranBio').click(function () {
  //       $('#ZohranBio').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor1').click(function () {
  //       $('#Advisor1').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor1').click(function () {
  //       $('#Advisor1').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor2').click(function () {
  //       $('#Advisor2').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor2').click(function () {
  //       $('#Advisor2').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor3').click(function () {
  //       $('#Advisor3').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor3').click(function () {
  //       $('#Advisor3').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor4').click(function () {
  //       $('#Advisor4').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor4').click(function () {
  //       $('#Advisor4').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor5').click(function () {
  //       $('#Advisor5').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor5').click(function () {
  //       $('#Advisor5').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  //   $(document).ready(function () {
  //     // Show modal when button is clicked
  //     $('#showAdvisor6').click(function () {
  //       $('#Advisor6').removeClass('hidden');
  //       $('html, body').addClass('overflow-y-hidden');
  //     });

  //     // Hide modal when close button is clicked
  //     $('#hideAdvisor6').click(function () {
  //       $('#Advisor6').addClass('hidden');
  //       $('html, body').removeClass('overflow-y-hidden');
  //     });
  //   });
  // }, []);
  return (
    <>
      {/* Banner */}
      <section className="pt-[7rem] xl:pt-[5rem]">
        <div className="container-custom mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-5/12 md:w-6/12 w-full">
              <div>
                <h1 className="text-[45px] leading-[40px] sm:text-[70px] sm:leading-[65px] md:text-[55px] md:leading-[50px] lg:text[65px] lg:leading-[60px] xl:text-[80px] xl:leading-[85%] min-[1920px]:text-[90px] min-[1920px]:leading-[100%]">
                  We believe our kids deserve an internet that{' '}
                  <span className="color2">
                    helps them become their best selves.
                  </span>
                </h1>
              </div>
            </div>
            <div className="lg:w-7/12 md:w-6/12 w-full">
              <img
                src="/images/about-us/img-about-us-banner.png"
                className="hidden lg:block w-full"
                alt=""
              />
              <img
                src="/images/about-us/mobile/img-about-us-banner-mobile.png"
                className="lg:hidden w-full   "
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
      {/* Session Content About Us 1 */}
      <section>
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className='max-lg:flex max-lg:flex-row max-lg:justify-center'>
              <img src="/images/about-us/im-aahil.png" className="" alt="" />
            </div>
            <FadeInView className="fade-right">
              <h2 className="font-extrabold font-gallix-extrabold text-[50px] leading-[40px] px-[1.5rem] lg:px-0 py-[1.5rem] sm:text-[60px] sm:leading-[50px] xl:text-[80px] xl:leading-[65px] 2xl:text-[80px] 2xl:leading-[65px] min-[1920px]:text-[100px] min-[1920px]:leading-[78px] text-center lg:text-left">
                Hi there!
                <br />
                I’m Aahil
                <span className="check-point" />
              </h2>
              <p className='text-center lg:text-left'>
                I’m an entrepreneur and student at Thomas Jefferson High School.
                <br />
                <br />
                The internet is such a powerful source for good, for learning
                and growth. Yet parents have to continuously worry that their
                kids will be exposed to less than ideal content.
                <br />
                <br />I believe in a world that offers kids the Internet on
                training wheels. So they can grow, create, and learn without
                worry of seeing content that’s not age-appropriate. We’re so
                passionate about this mission. And we’re so glad you’re here.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>
      {/* Session Content About Us 2 */}
      <section className="lg:py-[6rem] py-[3rem]">
        <div className="container-custom mx-auto">
          <div className="lg:w-8/12 w-full mx-auto flex justify-center relative">
            <img
              src="/images/about-us/aahil-founder-play.png"
              alt=""
              onClick={() => setShowModals({ ...showModals, videoModal: true })}
              className='hover:cursor-pointer'
            />
            <span className="pulse-button absolute top-[50%] translate-x-[-50%] left-[50%] translate-y-[-50%]">
              <button
                onClick={() =>
                  setShowModals({ ...showModals, videoModal: true })
                }
              >
                <img
                  src="/images/about-us/play.svg"
                  alt=""
                  className="w-[100px] h-[100px]"
                />
              </button>
            </span>
          </div>
        </div>
      </section>
      {/* Session Content About Us 4 */}
      <section>
        <div className="container-custom mx-auto">
          <h2 className="text-center font-extrabold font-gallix-extrabold text-[50px] leading-[40px] px-[1.5rem] lg:px-0 py-[1.5rem] sm:text-[60px] sm:leading-[50px] xl:text-[80px] xl:leading-[65px] 2xl:text-[80px] 2xl:leading-[65px] min-[1920px]:text-[100px] min-[1920px]:leading-[78px]">
            Team
            <span className="check-point" />
          </h2>
          <div className="grid lg:grid-cols-2 gap-4 mt-[4rem]">
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto"
                  src="/images/about-us/aahil-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Aahil Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Founder and CEO
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Aahil founded Safe Kids after discovering the ineffectiveness
                  and counterproductivity of existing parental control
                  solutions. He patented the mental health framework called
                  {`"Pause, Reflect and Redirect," which transforms children's
                  behavior, enabling them to...`}
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, aahilBio: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto"
                  src="/images/about-us/zohran-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Zohran Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Founder and CTO
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Zohran established Safe Kids in response to the prevailing
                  negative atmosphere created by parental control solutions
                  resulting in constant parental surveillance. His objective was
                  to develop software that prioritizes...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, zohranBio: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
      {/* Session Content About Us 5 */}
      <section className="lg:pt-[6rem] pt-[3rem]">
        <div className="container-custom mx-auto">
          <h2 className="text-center font-extrabold font-gallix-extrabold text-[50px] leading-[40px] px-[1.5rem] lg:px-0 py-[1.5rem] sm:text-[60px] sm:leading-[50px] xl:text-[80px] xl:leading-[65px] 2xl:text-[80px] 2xl:leading-[65px] min-[1920px]:text-[100px] min-[1920px]:leading-[78px]">
            Advisors
            <span className="check-point" />
          </h2>
          <div className="grid xl:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-10 mt-[4rem]">
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/judith-o-rorke-trigiani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Judith O’Rorke-Trigiani, PhD
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Judy brings nearly 30 years experience as a practicing school
                  psychologist in suburban Washington, DC. She holds a doctorate
                  in counseling and personnel services. She is a frequent guest
                  lecturer and adjunct faculty at local universities in the DC
                  area teaching...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor1: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div className="box-user-about-us">
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/allen-j-klein.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Allen J. Klein PLLC
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Allen has spent the last 30 years at the intersection of
                  technology. As a partner at ShawPittman (now Pillsbury Shaw
                  Pittman) and then Latham &amp; Watkins, and on his own since
                  retiring from Latham nearly a decade ago, he has represented
                  clients in...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor2: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div className="box-user-about-us">
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/pam-wisniewski.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Pam Wisniewski, PhD
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Allen has spent the last 30 years at the intersection of Dr.
                  Wisniewski is an Associate Professor in Human-Computer
                  Interaction whose work lies at the intersection of Social
                  Computing and Privacy. She is an expert in the interplay
                  between social media, privacy, and online safety for
                  adolescents. She has authored...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor3: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/annie-khalid.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Annie H. Khalid
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Annie, a former DC-based corporate litigator, is a Silicon
                  Valley tech attorney who is passionate about privacy andonline
                  safety for children. As a longstanding community volunteer and
                  advocate for youth and education initiatives, she is very
                  honored...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor4: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/hasnain-aslam.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Hasnain Aslam
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Hasnain Aslam is a founding partner and the Chief Investment
                  Officer at The Resource Group. He has spearheaded TRG’s growth
                  through over 25 acquisitions and divestitures since its
                  inception in 2002. He serves on the boards of several TRG
                  companies...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor5: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
            <FadeInView className="text-center fade-bottom">
              <div>
                <img
                  className="mx-auto w-[221px] h-[221px]"
                  src="/images/about-us/abbas-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Abbas Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
                <p className="px-[0.4rem] lg:px-[1rem]">
                  Abbas is an entrepreneur who has built successful companies
                  and is now dedicating his career to improving the way kids
                  live and learn online. Most notably, Abbas served as
                  co-founder and Managing Director of Primatics Financial (sold
                  to SS&amp;C), a...
                </p>
                <div className="text-[#ff1d43] text-[22px] cursor-pointer no-underline pt-[1rem]">
                  <button onClick={() => setShowModals({...showModals, advisor6: true })}>
                    Full Bio{' '}
                    <img
                      className="inline"
                      src="/images/about-us/icon-bio.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
      <section id="session-content-about-us6">
        <div className="text-center mx-auto lg:w-8/12 w-full text-white">
          <h2 className="font-extrabold px-[1.5rem] sm:px-[2rem] lg:px-0 font-gallix-extrabold text-[20px] leading-[28px] min-[321px]:text-[30px] min-[321px]:leading-[35px] min-[481px]:text-[40px] min-[481px]:leading-[45px] xl:text-[50px] xl:leading-[100%]">
            The Safe Kids team has exceeded all expectations in our launch year,
            keeping us informed and involved in the roll-out and implementation
            process.
          </h2>
          <h6 className="text-[20px] leading-[18px] pt-[1rem] mb-[0.5rem] xl:text-[24px] xl:leading-[26px] xl:pt-[3rem]">
            Paul Casto
          </h6>
          <p className="text-base sm:text-lg leading-[18px] sm:leading-[22px] opacity-[0.7]">
            Superintendent – A+UP Charter School
          </p>
        </div>
      </section>
      {/* Footer */}

      <Modal
        open={showModals.aahilBio}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, aahilBio: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/aahil-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Aahil Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Founder and CEO
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Aahil founded Safe Kids after discovering the ineffectiveness
                  and counterproductivity of existing parental control
                  solutions. He patented the mental health framework called
                  {`"Pause, Reflect and Redirect,"`} which transforms{' '}
                  {`children's
                  behavior, enabling them to prioritize healthy internet usage.
                  Currently, Aahil is a student at Thomas Jefferson High School
                  for Science and Technology, renowned as the country's top
                  public school. His interests encompass writing poetry, playing
                  squash, and participating in the school's Lacrosse team.
                  Additionally, he is an enthusiastic chess player.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.zohranBio}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, zohranBio: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/zohran-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Zohran Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Founder and CTO
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Zohran established Safe Kids in response to the prevailing
                  negative atmosphere created by parental control solutions and
                  their, constant parental surveillance. His objective was to
                  develop software that prioritizes trust and communication
                  within families. Zohran possesses a profound passion for
                  technology, having begun writing programmatic code at the
                  tender age of 6. He has advanced his skills by constructing
                  machine-learning algorithms utilizing Tensorflow/Python and
                  creating Chrome extensions using JavaScript and TypeScript on
                  Node.js. During his leisure time, Zohran indulges in
                  activities such as playing chess, squash, and the enchanting
                  melodies of the cello.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor1}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor1: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/judith-o-rorke-trigiani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Judith O’Rorke-Trigiani, PhD
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Judy brings nearly 30 years experience as a practicing school
                  psychologist in suburban Washington, DC. She holds a doctorate
                  in counseling and personnel services. She is a frequent guest
                  lecturer and adjunct faculty at local universities in the DC
                  area teaching about human development, school counseling,
                  mental health, social skills, and neurodiversity. Her
                  published works include articles on mental health,
                  neurodiversity, and advocacy as well as several children’s
                  books to meet her students’ needs. Dr. O’Rorke-Trigiani
                  presents on these topics at state and national conferences and
                  webinars including the American School Counselor Association
                  and the American Counseling Association.
                  <br />
                  <br />
                  She and her family, including two teenage boys, reside in the
                  Maryland suburbs of Washington, D.C. and are frequent
                  volunteers at Ronald McDonald House, the Greg Gannon Food
                  Drive, AAUW, and other organizations helping the community.
                  She looks forward to her next passion project keeping children
                  safer online.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor2}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor2: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/allen-j-klein.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Allen J. Klein PLLC
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Allen has spent the last 30 years at the intersection of
                  technology. As a partner at ShawPittman (now Pillsbury Shaw
                  Pittman) and then Latham &amp; Watkins, and on his own since
                  retiring from Latham nearly a decade ago, he has represented
                  clients in connection with AI agreements, SaaS agreements,
                  technology (and other) outsourcing agreements, licensing
                  agreements, software implementation and integration
                  agreements, and software development agreements among others
                  in the US, the UK, Switzerland, Netherlands, Germany, Canada,
                  India, Mexico, and South Africa. Moreover, during his first
                  years at Latham he worked in close coordination with the
                  firm’s technology team leading the firm’s effort to comply
                  with data privacy rules and regulations as it expanded
                  globally. Allen also works as a software litigation consultant
                  assisting attorneys litigating claims arising from failed
                  software implementations and mediates disputes arising from
                  technology transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor3}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor3: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/pam-wisniewski.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Pam Wisniewski, PhD
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Dr. Wisniewski is an Associate Professor in Human-Computer
                  Interaction whose work lies at the intersection of Social
                  Computing and Privacy. She is an expert in the interplay
                  between social media, privacy, and online safety for
                  adolescents. She has authored over 90 peer-reviewed
                  publications and won multiple best papers (top 1%) and best
                  paper honorable mentions (top 5%) at ACM SIGCHI conferences.{' '}
                  <br /> <br />
                  She has been awarded $4.69 million in external grant funding,
                  including the NSF CAREER Award, and her research has been
                  featured by popular news media outlets, including ABC News,
                  NPR, Psychology Today, and U.S. News and World Report. She is
                  an ACM Senior Member and the first and only computer scientist
                  to be selected as a William T. Grant Scholar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor4}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor4: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/annie-khalid.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Annie H. Khalid
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Annie is an attorney who started her legal career as a
                  corporate litigator at a large DC-based firm, where she also
                  maintained an active pro bono practice advocating for
                  disadvantaged women and children. She later moved to Silicon
                  Valley, becoming an in-house tech attorney counseling in all
                  business areas, including product development, data privacy,
                  regulatory compliance and corporate/IP transactions, for
                  consumer and enterprise software, hardware and services. Her
                  expansive experience at both large and startup tech companies
                  spans across a diverse range of industries, including
                  cybersecurity, consumer electronics, fintech, social
                  broadcasting/media, HR tech, and online/app services.
                  Additionally, Annie has maintained a commitment to community
                  service and the promotion of DEI initiatives.
                  <br />
                  <br />
                  She is a long-standing volunteer for youth programs advocating
                  for education equity and inclusion in underserved communities
                  and, most relevantly, passionate about online safety for
                  children. Annie is very honored and excited to support Safe
                  Kids in its meaningful mission to empower kids’ safety online
                  by helping them pause, reflect and be directed to make better
                  decisions! When not out supporting innovative technologies or
                  youth initiatives, Annie can be found promoting physical
                  fitness and mental wellness as an avid runner and yogi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor5}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor5: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/hasnain-aslam.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Hasnain Aslam
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Hasnain Aslam is a founding partner and the Chief Investment
                  Officer at The Resource Group. He has spearheaded TRG’s growth
                  through over 25 acquisitions and divestitures since its
                  inception in 2002. He serves on the boards of several TRG
                  companies. Prior to TRG, Hasnain was the Director of Corporate
                  Development at Align Technology and an investment banker at JP
                  Morgan in New York and San Francisco. Hasnain also serves as
                  Chairman of the Board of OPEN, Washington D.C. and as a board
                  member of the D.C. Chapter of The Citizens Foundation USA.
                  Hasnain has an A.B. with Honors from Harvard University and
                  his diverse interests include car racing, squash, and studying
                  South Asian poetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={showModals.advisor6}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, advisor6: value })
        }
        title='Full Bio'
      >
        <div className="flex justify-center items-center h-full">
          <div className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left transition-all w-full sm:max-w-6xl sm:p-6 max-h-[90vh] ">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="text-center">
                <img
                  className="mx-auto"
                  src="/images/about-us/abbas-valliani.png"
                  alt=""
                />
                <h6 className="text-[20px] leading-[20px] pt-[1rem] font-bold md:text-[24px] md:leading-[24px] md:pt-[1.5rem]">
                  Abbas Valliani
                </h6>
                <p className="text-[20px] leading-[20px] font-semibold opacity-50 md:text-[24px] md:leading-[24px] pt-[0.5rem] pb-[1rem]">
                  Advisory Board
                </p>
              </div>
              <div>
                <p className="lg:text-[24px] lg:leading-[36px] text-lg leading-[28px] text-center lg:text-left">
                  Abbas is an entrepreneur who has built successful companies
                  and is now dedicating his career to improving the way kids
                  live and learn online. Most notably, Abbas served as
                  co-founder and Managing Director of Primatics Financial (sold
                  to SS&amp;C), a pioneering fintech company with some of the
                  largest clients in the banking industry and Infinitelogic,
                  Inc, a family-owned private equity company. He is extremely
                  passionate about SafeKids and his mission is to get Safe Kids
                  on every laptop and device that kids use daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <VideoPlayer
        videoSrc='https://www.youtube.com/embed/E7vhpFryVAc?autoplay=1'
        open={showModals.videoModal}
        setOpen={(value: boolean) =>
          setShowModals({ ...showModals, videoModal: value })
        }
      />
    </>
  );
};

export default About;
