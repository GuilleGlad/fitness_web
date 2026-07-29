import React, { useEffect, useMemo, useState, useRef } from 'react';
import VideoBackground from '../components/VideoBackgrounds';
import BigLink from '../components/BigLink';
import BigSubTitle from '../components/BigSubTitle';
import Navbar from '../components/Navbar';
import FloatingCard from '../components/FloatingCard';
import BigTitle from '../components/BigTitle';
import FloatingText from '../components/FloatingText';
import ContadorRRSS from '../components/ContadorRRSS';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import '../styles/Homepage.css'
import News from '../components/News';
import Footer from '../components/Footer';
import RecipeCardGrid from '../components/RecipeCardGrid';
import ExerciseCardGrid from '../components/ExerciseCardGrid';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import ImageCard from '../components/ImageCard';
import { faRandom } from '@fortawesome/free-solid-svg-icons';


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
    const [news, setNews] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [exercises, setExercises] = useState([]);
    const sliderRef = useRef(null);
    const sliderNewsRef = useRef(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                await axios.get(`${apiUrl}/admin/settings`).then((response) => {
                    const { data } = response;
                    if (data) {
                        const { result } = data;
                        const result_arr = result[0];
                        const { logo, title, video } = result_arr;
                        setSettings({
                            logoUrl: result_arr.logo || '',
                            homeCarouselUrls: (JSON.parse(result_arr.gallery) || []).join('\n'),
                            adsCarouselUrls: (JSON.parse(result_arr.ads) || []).join('\n'),
                            titulo: result_arr.title || '',
                            videoUrl: result_arr.video_background || '',
                            aboutUrl: result_arr.about || '',
                            username: result_arr.username || '',
                            email: result_arr.email || '',
                            phone: result_arr.phone || '',
                            address: result_arr.address || ''
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

        const fetchNews = async () => {
            try {
                const response = await axios.get(`${apiUrl}/news/list`);
                const { data } = response;
                if (data) {
                    const { filas } = data;
                    console.log('Noticias cargadas:', filas);
                    setNews(filas);
                }
            }
            catch (error) {
                console.error('Error cargando noticias:', error);
            }
        }

        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`${apiUrl}/recipes/list-public`);
                const { data } = response;
                if (data) {
                    const { filas } = data;
                    console.log('Recetas cargadas:', filas);
                    setRecipes(filas);
                }
            }
            catch (error) {
                console.error('Error cargando noticias:', error);
            }
        }

        const fetchExercises = async () => {
            try {
                const response = await axios.get(`${apiUrl}/exercises/list-public`);
                const { data } = response;
                if (data) {
                    const { exercises } = data;
                    console.log('Ejercicios cargados:', exercises);
                    setExercises(exercises);
                }
            }
            catch (error) {
                console.error('Error cargando noticias:', error);
            }
        }

        fetchSettings();
        fetchNews();
        fetchRecipes();
        fetchExercises();

    }, []);

    // FIX DEFINITIVO: el mecanismo interno "responsive" de react-slick mide
    // window.innerWidth en un momento poco confiable del ciclo de montaje, y
    // solo se recalcula bien ante un evento resize REAL (ej. rotar el
    // telefono). En vez de depender de eso, calculamos nosotros mismos el
    // "bucket" de ancho (mobile/tablet/desktop), esperamos a estar montados
    // en el cliente para recién ahí renderizar el <Slider>, y forzamos un
    // remount limpio (via `key`) cada vez que cambia el bucket.
    const getSliderBucket = (width) => {
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        if (width <= 1024) return 'tabletLg';
        return 'desktop';
    };

    const [sliderBucket, setSliderBucket] = useState(() =>
        typeof window !== 'undefined' ? getSliderBucket(window.innerWidth) : 'desktop'
    );
    const [slidersReady, setSlidersReady] = useState(false);

    useEffect(() => {
        const updateBucket = () => setSliderBucket(getSliderBucket(window.innerWidth));
        updateBucket();
        setSlidersReady(true);
        window.addEventListener('resize', updateBucket);
        window.addEventListener('orientationchange', updateBucket);
        return () => {
            window.removeEventListener('resize', updateBucket);
            window.removeEventListener('orientationchange', updateBucket);
        };
    }, []);


    // NOTE: Replace '/videos/hero-bg.mp4' with the actual path to your video asset.
    const videoPath1 = settings.videoUrl || '/videos/videoplayback.mp4';
    const videoPath2 = '/videos/videoplayback2.mp4';
    const logoPath = settings.logoUrl || '/images/Logo-01-1-1.png';
    const trainerPic = '/images/Image-02.jpg';
    const trainerName = settings.username || 'Sergio Zane';
    const trainerPhone = settings.phone || '';
    const defaultEmail = 'support@musclefit.com';
    const trainerEmail = settings.email || defaultEmail;
    const trainerAddress = settings.address || '';
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

    // --- ADS: en mobile se muestran como desplegable ---
    // Barajamos el orden una sola vez por cada set de adsImages (no en cada
    // render), para que la imagen "de primero" sea aleatoria pero estable
    // mientras el usuario interactúa con el botón "Más...".
    const shuffledAdsImages = useMemo(() => {
        const arr = [...adsImages];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [adsImages]);

    const [adsExpanded, setAdsExpanded] = useState(false);
    const isMobileAds = sliderBucket === 'mobile';

    // Si el usuario redimensiona/rota y deja de ser mobile, reseteamos el
    // estado para que la próxima vez que vuelva a mobile arranque colapsado.
    useEffect(() => {
        if (sliderBucket !== 'mobile') {
            setAdsExpanded(false);
        }
    }, [sliderBucket]);

    const visibleAdsImages = (isMobileAds && !adsExpanded)
        ? shuffledAdsImages.slice(0, 1)
        : shuffledAdsImages;

    // slidesToShow/slidesToScroll ya NO vienen del array "responsive" interno
    // de slick (que es el que fallaba en la primera carga). Vienen de
    // sliderBucket, que nosotros calculamos de forma confiable en el useEffect
    // de arriba.
    const slidesByBucket = {
        mobile: 1,
        tablet: 2,
        tabletLg: 2,
        desktop: 3,
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        slidesToShow: slidesByBucket[sliderBucket],
        slidesToScroll: 1,
    };

    const sliderSettingsNews = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        slidesToShow: slidesByBucket[sliderBucket],
        slidesToScroll: 1,
    };

    return (
        <>
            <Helmet>
                <title>{settings.titulo || "Elite Fit Training"}</title>
            </Helmet>
            <div className="homepage-wrapper bg-black overflow-x-hidden">
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
                        <div className='min-h-[80vh]'>
                            <Navbar logoPath={logoPath}></Navbar>
                            <div className='items-center absolute bottom-0 flex-1 md:flex'>
                                <div className="w-full lg:w-1/2 mb-10">
                                    <FloatingCard trainerPic={trainerPic} trainerName={trainerName} trainerPhone={trainerPhone} trainerEmail={trainerEmail} ></FloatingCard>
                                </div>
                                <div className="w-full md:w-1/2 lg:w-2/3 mr-32">
                                    <BigTitle title="ALCANZA TUS METAS JUNTO A NOSOTROS"></BigTitle>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='separator lg:pt-32 pt-12 bg-black'></div>
                {/* ABOUT */}
                {/* <div className="flex bg-black" id='about'>
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
            <div className='separator lg:pt-32 pt-12 bg-black'></div> */}
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
                <div className='separator lg:pt-32 pt-12 bg-black'></div> */}
                    {/* RRSS */}
                    <div className="bg-black w-full flex flex-col items-center px-6 lg:px-0">

                        {/* TÍTULO */}
                        <div className="w-full flex justify-center mb-10">
                            <BigTitle
                                title="GUIADOS POR EL MEJOR"
                                color="text-white"
                                size="text-4xl lg:text-8xl"
                            />
                        </div>

                        {/* BLOQUE IMAGEN + CONTADORES (solo horizontal en desktop) */}
                        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-center gap-10">

                            {/* Imagen */}
                            <div className="w-full lg:w-1/2 flex justify-center">
                                <img
                                    src="/images/Shape-01.png"
                                    className="w-full max-w-sm lg:max-w-md"
                                    alt=""
                                />
                            </div>

                            {/* Contadores */}
                            <div className="w-full lg:w-1/2 flex justify-center">
                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <ContadorRRSS logo="youtube" title="youtube" account="sergiozane" count="2,1M" />
                                    <ContadorRRSS logo="x" title="X" account="sergiozane" count="2,1M" />
                                    <ContadorRRSS logo="facebook" title="facebook" account="sergiozane" count="2,1M" />
                                    <ContadorRRSS logo="instagram" title="instagram" account="sergiozane" count="2,1M" />
                                </div>
                            </div>

                        </div>

                    </div>



                    <div className='separator lg:pt-32 pt-12 bg-black'></div>
                    {/* RESULTS */}
                    <div className="bg-black w-full flex-1 lg:mr-32 mr-4">

                        {/* Encabezado */}
                        <div className="flex flex-col lg:flex-row bg-black lg:mr-32">

                            <div className="lg:w-1/4 w-full mb-4 lg:mb-0">
                                {/* <FloatingText
                                    text="RESULTADOS"
                                    color="text-white lg:ml-32"
                                    iconColor="#b8fb00"
                                /> */}
                            </div>

                            <div className="lg:w-3/4 w-full">
                                <BigTitle
                                    title="RESULTADOS DE MIS CLIENTES"
                                    color="text-white"
                                    size="text-4xl lg:text-8xl"
                                />
                            </div>

                        </div>

                        {/* Carrusel */}
                        <div className="flex-1 bg-black">
                            <div
                                id="carousel"
                                className="w-full px-8 lg:px-32 mt-10 py-10 rounded-lg bg-gray-800"
                            >
                                {slidersReady && (
                                    <Slider key={sliderBucket} {...sliderSettings} ref={sliderRef}>
                                        {pictures.map((image, index) => (
                                            <div
                                                key={`${image}-${index}`}
                                                className="shadow-lg shadow-black drop-shadow-lg"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Slide ${index + 1}`}
                                                    className="w-full h-auto object-cover rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </Slider>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="bg-black w-full flex-1 mr-32">
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                {/* <FloatingText text="ADS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText> */}
                            </div>
                            <div className="flex flex-col lg:flex-row bg-black lg:mr-32">
                                <BigTitle title="MARCAS Y PATROCINADORES" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                            </div>
                        </div>
                        <div className="flex-1 bg-black">
                            <div id='adsDiv' className='w-full px-8 lg:px-32 mt-10 py-10 rounded-lg bg-gray-800'>
                                <div className="w-full flex justify-center">
                                    <div
                                        className="
          columns-1
          sm:columns-2
          md:columns-3
          lg:columns-4
          gap-4
          p-4
          max-w-7xl
        "
                                    >
                                        {visibleAdsImages.map((src, index) => (
                                            <div
                                                key={index}
                                                className="
              mb-4
              break-inside-avoid
              overflow-hidden
              rounded-xl
              shadow-lg
              bg-white
              animate-fadeIn
            "
                                                style={{
                                                    animationDelay: `${index * 120}ms`,
                                                }}
                                            >
                                                <img
                                                    src={src}
                                                    alt={`brand-${index}`}
                                                    className="
                w-full
                h-auto
                object-cover
                hover:scale-105
                transition-transform
                duration-300
              "
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {isMobileAds && adsImages.length > 1 && (
                                    <div className="w-full flex justify-center mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setAdsExpanded((prev) => !prev)}
                                            className="px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            {adsExpanded ? 'Ocultar Marcas...' : 'Más Marcas...'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='separator lg:pt-32 pt-12 bg-black'></div>
                    {/* RRSS */}
                    {/* <div className="bg-black w-full flex-1 lg:mr-32 mr-4">

                        <div className="flex flex-col lg:flex-row bg-black lg:mr-32">
                            <div className="lg:w-1/4 w-full mb-4 lg:mb-0">
                                <FloatingText text="ADS" color="text-white lg:ml-32" iconColor="#b8fb00" />
                            </div>

                            <div className="lg:w-3/4 w-full">
                                <BigTitle
                                    title="MARCAS Y PATROCINADORES"
                                    color="text-white"
                                    size="text-4xl lg:text-8xl"
                                />
                            </div>
                        </div>

                        <div className="separator pt-20 bg-black"></div>

                        <div
                            className="
      max-w-7xl mx-auto
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-6
      px-4 lg:px-0
    "
                        >
                            <ImageCard
                                title="Individual training plan"
                                description="Diseño personalizado para alcanzar tus metas físicas y de salud."
                                imageUrl={adsImages[0] || '/images/cards/Image-07.jpg'}
                            />

                            <ImageCard
                                title="Nutrition guidance"
                                description="Guía nutricional balanceada y planes alimenticios adaptados a tu estilo de vida."
                                imageUrl={adsImages[1] || '/images/cards/Image-08.jpg'}
                            />

                            <div className="lg:row-span-2 h-full">
                                <ImageCard
                                    title="Flexible training times"
                                    description="Encuentra el horario perfecto que se ajuste a tus compromisos diarios."
                                    imageUrl={adsImages[2] || '/images/Shape-016.png'}
                                />
                            </div>

                            <ImageCard
                                title="Training in a private gym"
                                description="Máxima privacidad y equipamiento de vanguardia para tu comodidad."
                                imageUrl={adsImages[3] || '/images/cards/Image-09.jpg'}
                            />

                            <ImageCard
                                title="Training in a private gym"
                                description="Máxima privacidad y equipamiento de vanguardia para tu comodidad."
                                imageUrl={adsImages[4] || '/images/cards/Image-010-1.jpg'}
                            />
                        </div>
                    </div> 

                    <div className='separator lg:pt-32 pt-12 bg-black'></div>
                    {/* NOTICIAS */}
                    <div className="bg-black w-full flex-1 lg:mr-32 mr-4">
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                {/* <FloatingText text="SECCION INFORMATIVA" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText> */}
                            </div>
                            <div className='w-3/4'>
                                <BigTitle title="MUNDO FITNESS" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                            </div>
                        </div>
                        <div className="w-full px-8 lg:px-32 mt-10 py-10 rounded-lg bg-gray-800">
                            {slidersReady && (
                                <Slider key={sliderBucket} {...sliderSettingsNews} ref={sliderNewsRef}>
                                    {
                                        news.map((item, index) => (
                                            <News key={index} text={item.text} image={item.image_url} title={item.title} />
                                        ))
                                    }
                                </Slider>
                            )}
                        </div>

                    </div>
                    <div className='separator lg:pt-32 pt-12 bg-black'></div>
                    {/* RECIPES */}
                    <div className="bg-black w-full flex-1 lg:mr-32 mr-4">
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                {/* <FloatingText text="RECETAS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText> */}
                            </div>
                            <div className='w-3/4'>
                                <BigTitle title="FITNESS PARA LLEVAR" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                            </div>
                        </div>
                        <div className="w-full px-8 lg:px-32 mt-10 py-10 rounded-lg bg-gray-800">
                            <RecipeCardGrid
                                recipes={recipes.map(r => ({
                                    id: r.id,
                                    title: r.title,
                                    ingredients: r.ingredients,
                                    instructions: r.instructions,
                                    image_url: r.image_url,
                                    status: true
                                }))}
                                title=""
                            />
                        </div>

                    </div>
                    <div className='separator lg:pt-32 pt-12 bg-black'></div>

                    {/* EJERCICIOS PUBLICOS */}
                    <div className="bg-black w-full flex-1 lg:mr-32 mr-4">
                        <div className="flex-1 lg:flex bg-black lg:mr-32">
                            <div className="w-1/4">
                                {/* <FloatingText text="EJERCICIOS" color="text-white lg:ml-32" iconColor='#b8fb00'></FloatingText> */}
                            </div>
                            <div className='w-3/4'>
                                <BigTitle title="DESTACADOS" color="text-white" size="text-4xl lg:text-8xl"></BigTitle>
                            </div>
                        </div>
                        <div className="w-full px-8 lg:px-32 mt-10 py-10 rounded-lg bg-gray-800">
                            <ExerciseCardGrid
                                exercises={exercises.map(e => ({
                                    id: e.id,
                                    title: e.title,
                                    description: e.description,
                                    photo_url: e.photo_url,
                                    video_url: e.video_url
                                }))}
                                title=""
                            />
                        </div>

                    </div>
                    <div className='separator lg:pt-32 pt-12 bg-black'></div>

                    {/* FAQ */}
                    {/* <div className="bg-black w-full flex-1 mr-32">
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

                <div className='separator lg:pt-32 pt-12 bg-black'></div> */}

                    {/* VIDEO2 */}
                    {/* <div className="video-background-container ">

                    <video
                        className="video-background"
                        src={videoPath2}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/path/to/placeholder.jpg" // Optional: shows an image before video loads
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="video-content-overlay lg:ml-16">
                        <div className='h-[80lvh]'>
                            <div className='items-center absolute bottom-0 flex-col md:flex'>
                                <div className="w-full ml-32 mr-32">
                                    <BigSubTitle title="TRANSFORMA TU CUERPO DESDE HOY" subtitle="Da el primer paso hacia una versión de ti más fuerte, saludable y segura." button_text="UNETE YA" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div> */}
                    {/* <div className='separator lg:pt-32 pt-12 bg-black'></div> */}
                    <div className="bg-black flex-1">
                        {/* <Footer logoPath={logoPath} email={defaultEmail} links={["transformations", "about us", "pricing", "how to start", "faq"]}/> */}
                        <Footer logoPath={logoPath} email={trainerEmail} trainerPhone={trainerPhone} trainerAddress={trainerAddress} />
                    </div>
                    <div className='separator lg:pt-32 pt-12 bg-black'></div>
                </>

            </div>
        </>
    );
}

export default Homepage;