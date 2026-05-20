import React from 'react';
import '../styles/VideoBackgrounds.css';

/**
 * VideoBackground component
 * 
 * Displays a responsive video as a background element.
 * 
 * @param {object} props
 * @param {string} props.videoSrc - The URL path to the video file (e.g., '/assets/background.mp4').
 * @returns {JSX.Element}
 */
const VideoBackground = ({ videoSrc }) => {
    if (!videoSrc) {
        console.error("VideoBackground requires a 'videoSrc' prop.");
        return <div className="video-background-container" style={{ minHeight: '50vh', backgroundColor: '#222' }}>
            <p style={{ color: 'white', zIndex: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Video source missing. Please provide the videoSrc prop.
            </p>
        </div>;
    }

    return (
        // The container defines the area the video will occupy
        <div className="video-background-container">
            
            {/* 
                The <video> element handles the background media.
                - autoPlay, loop, muted: Standard practices for background video players. 
                  (It's highly recommended to mute background videos).
            */}
            <video 
                className="video-background" 
                src={videoSrc} 
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
                <h1>Welcome to our amazing service!</h1>
                <p>This text sits perfectly over the dynamic video background.</p>
            </div>
        </div>
    );
};

export default VideoBackground;