import React from 'react';
import VideoBackground from '../components/VideoBackgrounds';
import Navbar from '../components/Navbar';

function Homepage() {
    // NOTE: Replace '/videos/hero-bg.mp4' with the actual path to your video asset.
    const videoPath = '/videos/videoplayback.mp4'; 
    const logoPath = '/images/Logo-01-1-1.png';
    return (
        <div className="homepage-wrapper">
            <div className="video-background-container">
                
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
                <div className="video-content-overlay">
                    {/* PARENT COMPONENTS SHOULD PLACE THEIR CONTENT HERE */}
                    {/* Example Content: */}
                    <Navbar></Navbar>
                </div>
            </div>

        </div>
    );
}

export default Homepage;