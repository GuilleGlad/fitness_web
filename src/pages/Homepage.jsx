import React from 'react';
import VideoBackground from '../components/VideoBackgrounds';
import Navbar from '../components/Navbar';
import FloatingCard from '../components/FloatingCard';
import BigTitle from '../components/BigTitle';
import Logo from '../components/Logo';
import FloatingText from '../components/FloatingText';
import BigLink from '../components/BigLink';
import ContadorRRSS from '../components/ContadorRRSS';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import '../styles/Homepage.css'

function Homepage() {
    // NOTE: Replace '/videos/hero-bg.mp4' with the actual path to your video asset.
    const videoPath = '/videos/videoplayback.mp4';
    const logoPath = '/images/Logo-01-1-1.png';
    const trainerPic = '/images/Image-02.jpg';
    const trainerName = 'Sergio Zane';
    const pictures = [
        '/images/Image-03.jpg'
    ];

        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            
        };

        return (
            <div className="homepage-wrapper bg-black ">
                <div className="video-background-container ">

                    {/* 
                    The <video> element handles the background media.
                    - autoPlay, loop, muted: Standard practices for background video players. 
                    (It's highly recommended to mute background videos).
                */}
                    <video
                        className="video-background"
                        src={videoPath}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/path/to/placeholder.jpg" // Optional: shows an image before video loads
                    >
                        {/* Fallback for older browsers */}
                        Your browser does not support the video tag.
                    </video>

                    {/* 
                    This wrapper div is crucial for placing foreground content (text, buttons, etc.) 
                    on top of the video background, using z-index.
                */}
                    <div className="video-content-overlay lg:ml-16">
                        {/* PARENT COMPONENTS SHOULD PLACE THEIR CONTENT HERE */}
                        {/* Example Content: */}
                        <div className='h-[80lvh]'>
                            <Navbar></Navbar>
                            <div className='items-center absolute bottom-0 flex-1 md:flex'>
                                <div className="w-full lg:w-1/2">
                                    <FloatingCard trainerPic={trainerPic} trainerName={trainerName} ></FloatingCard>
                                </div>
                                <div className="w-full md:w-1/2 lg:w-2/3 mr-32">
                                    <BigTitle title=""></BigTitle>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='separator pt-32 bg-black'></div>
                {/* ABOUT */}
                <div className="flex bg-black" id='about'>
                    <div className="w-2/3 ">
                        <FloatingText text="ABOUT" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                    </div>
                    <div className='lg:mr-32'>
                        <BigTitle title="TARGETED TRAINING IN AN EXCLUSIVE PRIVATE GYM." color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                    </div>
                </div>
                <div className="flex-1 lg:flex bg-black">
                    <div className='w-full lg:w-1/3 p-8 lg:ml-32 '>
                        <img src={pictures[0]} className='rounded-xl shadow-lg justify-end' />
                    </div>
                    <div className="flex-1 mt-10 lg:ml-32">
                        <div className="flex lg:mr-32">
                            <div className=''>
                                <BigTitle title="Work with a dedicated coach in a refined, relaxed space built around your growth and your results." color="text-customYellow " size="text-2xl lg:text-6xl text-left"></BigTitle>
                            </div>
                        </div>
                        <div className="lg:flex flex-1 mt-5 gap-12">
                            <div className='text-white lg:w-1/3 text-lg mb-5'>Curabitur tincidunt, felis a elementum tincidunt, ex felis fermentum dui, eget pulvinar arcu eros eu eros. Vestibulum sollicitudin pretium velit, eget justo sit amet. Pellentesque in nulla in nisi dictum interdum.</div>
                            <div className='text-white lg:w-1/3 text-lg'>Etiam accumsan urna a mauris dapibus, nec nunc convallis. Phasellus eget justo et libero ultrices posuere. Cras euismod, arcu nec congue convallis, ipsum orci non libero.  amet felis placerat</div>
                        </div>
                    </div>
                </div>
                <div className='separator pt-32 bg-black'></div>
                {/* SERVICES */}
                <>
                    <div className='lg:mr-32 bg-black w-full'>
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                <FloatingText text="SERVICES" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                            </div>
                            <div className='w-3/4'>
                                <BigLink text="PERSONAL TRAINING" color="text-white"></BigLink>
                            </div>
                        </div>
                        <div className="flex lg:flex bg-black mr-32">
                            <div className="w-1/4">

                            </div>
                            <div className='w-3/4'>
                                <BigLink text="GROUP TRAINING" color="text-white"></BigLink>
                            </div>
                        </div>
                        <div className="flex lg:flex bg-black mr-32">
                            <div className="w-1/4">

                            </div>
                            <div className='w-3/4'>
                                <BigLink text="CORPORATE TRAINING" color="text-white"></BigLink>
                            </div>
                        </div>
                    </div>
                    <div className='separator pt-32 bg-black'></div>
                    {/* RRSS */}
                    <div className="bg-black w-full flex mr-32">
                        <span className="text-white ml-32 text-6xl w-1/4 font-semibold">Guided by the Best</span>
                        <img src="/images/Shape-01.png" className='w-1/4' alt="" />
                        <div className='w-1/4 ml-32'>
                            <div className='grid grid-cols-2 relative top-60'>
                                <ContadorRRSS logo="youtube" title="youtube" account="sergiozane" count="2,1M" />
                                <ContadorRRSS logo="x" title="X" account="sergiozane" count="2,1M" />
                                <ContadorRRSS logo="facebook" title="facebook" account="sergiozane" count="2,1M" />
                                <ContadorRRSS logo="instagram" title="instagram" account="sergiozane" count="2,1M" />
                            </div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    <div className='separator pt-32 bg-black'></div>
                    {/* RESULTS */}
                    <div className="bg-black w-full flex-1 mr-32">
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                <FloatingText text="RESULTS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                            </div>
                            <div className='w-3/4'>
                                <BigTitle title="SEE MY CLIENTS' RESULTS" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                            </div>
                        </div>
                        <div className="flex-1 bg-black">
                            <div id='carousel' className='ml-32 mr-32 mt-10 mb-20 p-10 rounded-lg bg-white '>
                                <Slider {...settings} >
                                    <div>
                                        <img src="/images/carousel/Testimonial-01.jpg" alt="Slide 1" />
                                        <span className='font-bold'>Lost 6Kg in 10 weeks, stronger.</span>
                                    </div>
                                    <div>
                                        <img src="/images/carousel/Testimonial-02.jpg" alt="Slide 2" />
                                        <span className='font-bold'>Dropped 8Kg in 12 weeks, faster.</span>
                                    </div>
                                    <div>
                                        <img src="/images/carousel/Testimonial-03.jpg" alt="Slide 3" />
                                        <span className='font-bold'>Lost 5Kg in 8 weeks, healthier.</span>
                                    </div>
                                    <div>
                                        <img src="/images/carousel/Testimonial-04.jpg" alt="Slide 4" />
                                        <span className='font-bold'>Down 7Kg, best muscle tone overvall.</span>
                                    </div>
                                    <div>
                                        <img src="/images/carousel/Testimonial-05.jpg" alt="Slide 5" />
                                        <span className='font-bold'>Lost 6Kg, gained strength and confidence .</span>
                                    </div>
                                    <div>
                                        <img src="/images/carousel/Testimonial-06.jpg" alt="Slide 6" />
                                        <span className='font-bold'>Gained 3Kg muscle in 12 weeks.</span>
                                    </div>
                                </Slider>
                            </div>
                        </div>
                    </div>
                    <div className='separator pt-32 bg-black'></div>
                </>

            </div>
        );
    }

    export default Homepage;