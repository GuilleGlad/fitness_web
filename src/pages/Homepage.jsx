import React, { useEffect, useMemo, useState } from 'react';
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
import ImageCard from '../components/ImageCard';
import Comments from '../components/Comments';
import News from '../components/News';
import Faq from '../components/Faq';
import BigSubTitle from '../components/BigSubTitle';
import Footer from '../components/Footer';
import axios from 'axios';
import { height } from '@fortawesome/free-solid-svg-icons/faUpRightFromSquare';

function Homepage() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const defaultSettings = {
    logoUrl: '',
    homeCarouselUrls: '',
    adsCarouselUrls: '',
    titulo: '',
    video: ''
    };    
    const STORAGE_KEY = 'elitefit_settings';
    const [settings, setSettings] = useState({
        logoUrl: '',
        homeCarouselUrls: '',
        adsCarouselUrls: '',
        titulo: '',
        video: '',
        about: ''
    });

    useEffect(() => {
 const fetchSettings = async () => {
      try {
        await axios.get(`${apiUrl}/admin/settings`).then((response) => {
          const { data } = response;
          if (data) {
            const {result} = data;
            const result_arr = result[0];
            const {logo , title, video} = result_arr;
            setSettings({
              logoUrl: result_arr.logo || '',
              homeCarouselUrls: (JSON.parse(result_arr.gallery) || []).join('\n'),
              adsCarouselUrls: (JSON.parse(result_arr.ads) || []).join('\n'),
              titulo: result_arr.title || '',
              videoUrl: result_arr.video_background || '',
              aboutUrl: result_arr.about || ''
            });
          }
        });
        console.log(settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        console.log('Ajustes cargados correctamente.');
      } catch (error) {
        console.error('Error cargando ajustes:', error);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('No se pudieron recuperar los ajustes:', error);
        }
      }
    }
    fetchSettings();
    }, []);

    // NOTE: Replace '/videos/hero-bg.mp4' with the actual path to your video asset.
    const videoPath1 = settings.videoUrl || '/videos/videoplayback.mp4';
    const videoPath2 = '/videos/videoplayback2.mp4';
    const logoPath = settings.logoUrl || '/images/Logo-01-1-1.png';
    const trainerPic = '/images/Image-02.jpg';
    const trainerName = 'Sergio Zane';
    const defaultEmail = 'support@musclefit.com';

    const pictures = useMemo(() => {
        const urls = (settings.homeCarouselUrls || '')
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        return urls.length > 0 ? urls : ['/images/Image-03.jpg'];
    }, [settings.homeCarouselUrls]);

    const adsImages = useMemo(() => {
        const urls = (settings.adsCarouselUrls || '')
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        return urls.length > 0 ? urls : ['/images/cards/Image-07.jpg'];
    }, [settings.adsCarouselUrls]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        
    };

    return (
        <div className="homepage-wrapper bg-black ">
            <title>{settings.titulo}</title>
            <div className="video-background-container ">

                {/* 
                    The <video> element handles the background media.
                    - autoPlay, loop, muted: Standard practices for background video players. 
                    (It's highly recommended to mute background videos).
                */}
                <video
                    className="video-background"
                    src={videoPath1}
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
                        <Navbar logoPath={logoPath}></Navbar>
                        <div className='items-center absolute bottom-0 flex-1 md:flex'>
                            <div className="w-full lg:w-1/2">
                                <FloatingCard trainerPic={trainerPic} trainerName={trainerName} ></FloatingCard>
                            </div>
                            <div className="w-full md:w-1/2 lg:w-2/3 mr-32">
                                <BigTitle title="ALCANZA TUS METAS JUNTO A NOSOTROS"></BigTitle>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='separator pt-32 bg-black'></div>
            {/* ABOUT */}
            <div className="flex bg-black" id='about'>
                <div className="w-2/3 ">
                    <FloatingText text="ACERCA DE NOSOTROS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                </div>
                <div className='lg:mr-32'>
                    <BigTitle title="Entrenamiento específico en un gimnasio privado exclusivo." color="text-white" size="text-4xl lg:text-7xl" uppercase="true"></BigTitle>
                </div>
            </div>
            <div className="flex-1 lg:flex bg-black">
                <div className='w-full lg:w-1/3 p-8 lg:ml-32 '>
                    <img src={settings.aboutUrl} className='rounded-xl shadow-lg justify-end' />
                </div>
                <div className="flex-1 mt-10 lg:ml-32">
                    <div className="flex lg:mr-32">
                        <div className=''>
                            <BigTitle title="Trabaja con un coach dedicado en un espacio refinado y relajado, diseñado en torno a tu crecimiento y tus resultados." color="text-customYellow " size="text-2xl lg:text-5xl text-left"></BigTitle>
                        </div>
                    </div>
                    <div className="lg:flex flex-1 mt-5 gap-12">
                        <div className='text-white lg:w-1/3 text-lg mb-5'>Logra tus objetivos de bienestar a través de un entrenamiento específico en un gimnasio privado exclusivo, un concepto diseñado para quienes buscan máxima efectividad y privacidad. Aquí, trabajas con un coach dedicado en un espacio refinado y relajado, diseñado en torno a tu crecimiento y tus resultados. </div>
                        <div className='text-white lg:w-1/3 text-lg'>Sin las distracciones ni las aglomeraciones de los centros convencionales, cada sesión se convierte en una experiencia premium totalmente personalizada. Este entorno sofisticado no solo optimiza tu rendimiento físico, sino que también te brinda la tranquilidad necesaria para enfocarte en tu evolución integral, garantizando un camino directo hacia tu mejor versión.</div>
                    </div>
                </div>
            </div>
            <div className='separator pt-32 bg-black'></div>
            {/* SERVICES */}
            <>
                {/* <div className='lg:mr-32 bg-black w-full'>
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
                <div className='separator pt-32 bg-black'></div> */}
                {/* RRSS */}
                <div className="bg-black w-full flex mr-32">
                    <span className="text-white ml-32 text-6xl w-1/4 font-semibold">Guiados por el mejor</span>
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
                            <FloatingText text="RESULTADOS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                        </div>
                        <div className='w-3/4'>
                            <BigTitle title="RESULTADOS DE MIS CLIENTES" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                        </div>
                    </div>
                    <div className="flex-1 bg-black">
                        <div id='carousel' className='ml-32 mr-32 mt-10 mb-20 p-10 rounded-lg bg-white '>
                            <Slider {...sliderSettings} >
                                {pictures.map((image, index) => (
                                    <div key={`${image}-${index}`}>
                                        <img src={image} alt={`Slide ${index + 1}`} className="h-full w-full " />
                                        {/* <span className='mt-3 block font-bold text-center'>Contenido destacado {index + 1}</span> */}
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
                <div className="bg-black w-full flex-1 mr-32">
                    <div className="flex-1 lg:flex bg-black lg:mr-32">
                        <div className="w-1/4">
                            <FloatingText text="ADS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                        </div>
                        <div className='w-3/4'>
                            <BigTitle title="MARCAS Y PATROCINADORES" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                        </div>
                    </div>
                    <div className="flex-1 bg-black">
                        <div id='carousel' className='ml-32 mr-32 mt-10 mb-20 p-10 rounded-lg bg-white '>
                            <Slider {...sliderSettings} >
                                {adsImages.map((image, index) => (
                                    <div key={`${image}-${index}`}>
                                        <img src={image} alt={`Slide ${index + 1}`} className="h-full w-full " />
                                        {/* <span className='mt-3 block font-bold text-center'>Contenido destacado {index + 1}</span> */}
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>                
                <div className='separator pt-32 bg-black'></div>
                {/* RRSS */}
                {/* <div className="bg-black w-full flex-1 mr-32 h-1/3">
                    <div className="flex-1 lg:flex bg-black lg:mr-32">
                        <div className="w-1/4">
                            <FloatingText text="WHY CHOOSE US" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                        </div>
                        <div className='w-3/4'>
                            <BigTitle title="WAYS I HELP YOU TRANSFORM FASTER" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                        </div>
                    </div>
                    <div className='separator pt-32 bg-black'></div>

                    <div className="max-w-7xl mx-auto grid grid-cols-3 grid-rows-2 gap-6">

                        <div className="">
                            <ImageCard
                                title="Individual training plan"
                                description="Diseño personalizado para alcanzar tus metas físicas y de salud."
                                imageUrl={adsImages[0] || '/images/cards/Image-07.jpg'}
                                altText="Individual training plan"
                            />
                        </div>
                        <div className="">
                            <ImageCard
                                title="Nutrition guidance"
                                description="Guía nutricional balanceada y planes alimenticios adaptados a tu estilo de vida."
                                imageUrl={adsImages[1] || '/images/cards/Image-08.jpg'}
                                altText="Nutrition guidance"
                            />
                        </div>
                        <div className="row-span-2 flex items-center justify-center font-bold text-xl">
                            <ImageCard
                                title="Flexible training times"
                                description="Encuentra el horario perfecto que se ajuste a tus compromisos diarios."
                                isCTA={true} // === ESTADO CTA ===
                                ctaText="Ver Disponibilidad"
                                ctaLink="/horarios"
                                imageUrl={adsImages[2] || '/images/Shape-016.png'}
                            />
                        </div>

                        <div className="">
                            <ImageCard
                                title="Training in a private gym"
                                description="Máxima privacidad y equipamiento de vanguardia para tu comodidad."
                                imageUrl={adsImages[3] || '/images/cards/Image-09.jpg'}
                                altText="Training in a private gym"
                            />
                        </div>
                        <div className="">
                            <ImageCard
                                title="Training in a private gym"
                                description="Máxima privacidad y equipamiento de vanguardia para tu comodidad."
                                imageUrl={adsImages[4] || '/images/cards/Image-010-1.jpg'}
                                altText="Training in a private gym"
                            />
                        </div>

                    </div>

                </div>
                <div className='separator pt-32 bg-black'></div> */}
                {/* NOTICIAS */}
                <div className="bg-black w-full flex-1 mr-32">
                    <div className="flex-1 lg:flex bg-black lg:mr-32">
                        <div className="w-1/4">
                            <FloatingText text="SECCION INFORMATIVA" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                        </div>
                        <div className='w-3/4'>
                            <BigTitle title="MUNDO FITNESS" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 ml-32 mr-32 mt-10 ">
                        <News text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo." picture="/images/Testimonials-07.jpg" title="titulo de prueba" />
                    </div>

                </div>
                <div className='separator pt-32 bg-black'></div>
                {/* FAQ */}
                <div className="bg-black w-full flex-1 mr-32">
                    <div className="flex-1 lg:flex bg-black lg:mr-32">
                        <div className="w-1/4">
                            <FloatingText text="FAQS QUESTIONS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText>
                        </div>
                        <div className='w-3/4'>
                            <BigTitle title="FAQ" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                        </div>
                    </div>
                    <div className='w-1/2 ml-[30%]'>
                        <div className="flex flex-col justify-center ">
                            <Faq title={"Do I need any equipment to get started?"} text={"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur."} />
                            <Faq title={"What happens if an exercise feels too hard?"} text={"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur."} />
                            <Faq title={"Will I actually see progress week by week?"} text={"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur."} />
                            <Faq title={"Can I do the workouts at home or de I need a gym?"} text={"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur."} />
                            <Faq title={"Has anyone actually transformed with this program?"} text={"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur."} />
                        </div>
                    </div>
                </div>

                <div className='separator pt-32 bg-black'></div>
                {/* VIDEO2 */}
                <div className="video-background-container ">

                    <video
                        className="video-background"
                        src={videoPath2}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/path/to/placeholder.jpg" // Optional: shows an image before video loads
                    >
                        {/* Fallback for older browsers */}
                        Your browser does not support the video tag.
                    </video>
                    <div className="video-content-overlay lg:ml-16">
                        <div className='h-[80lvh]'>
                            <div className='items-center absolute bottom-0 flex-col md:flex'>
                                <div className="w-full ml-32 mr-32">
                                    <BigSubTitle title="TRANSFORM YOUR BODY STARTING TODAY" subtitle="Take the first step toward a stronger, healthier, and more confident version of yourself." button_text="JOIN THE PROGRAM" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='separator pt-32 bg-black'></div>
                <div className="bg-black flex-1 ml-32 mr-32">
                    <Footer email={defaultEmail} links={["transformations", "about us", "pricing", "how to start", "faq"]}/>
                </div>
                <div className='separator pt-32 bg-black'></div>
            </>

        </div>
    );
}

export default Homepage;