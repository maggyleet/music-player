import React, { useRef, useState, useEffect, useCallback } from "react";
import songs from "./songs";
import "./index.css";

function MusicPlayer() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(null);
    const currentSong = songs[currentIndex];

    const handleNext = useCallback(() => {
        if (isShuffle) {
            let rand;
            do {
                rand = Math.floor(Math.random() * songs.length);
            } while (rand === currentIndex);
            setCurrentIndex(rand);
        } else {
            setCurrentIndex((prev) => (prev + 1) % songs.length);
        }
        setIsPlaying(true);
    }, [isShuffle, currentIndex]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) =>
        isNaN(time) ? "0:00" : `${Math.floor(time / 60)}:${("0" + Math.floor(time % 60)).slice(-2)}`;

    const seek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * audioRef.current.duration;
    };

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const setMetadata = () => setDuration(audio.duration);

        const handleEnd = () => {
            if (isRepeat) {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleNext();
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setMetadata);
        audio.addEventListener("ended", handleEnd);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setMetadata);
            audio.removeEventListener("ended", handleEnd);
        };
    }, [handleNext, isRepeat]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentIndex, isPlaying]);

    return (
        <div className="player-box">
            <h2 className="track-title">{currentSong.title}</h2>
            <p className="track-artist" key={currentSong.title}>
                <span>{currentSong.artist}</span>
            </p>

            <audio ref={audioRef} src={currentSong.src} preload="metadata" />

            <div className="extra-controls">
                <button
                    className={isShuffle ? "active" : ""}
                    onClick={() => setIsShuffle(!isShuffle)}
                    title="Shuffle"
                >
                    🔀 Shuffle
                </button>
                <button
                    className={isRepeat ? "active" : ""}
                    onClick={() => setIsRepeat(!isRepeat)}
                    title="Repeat"
                >
                    🔁 Repeat
                </button>
            </div>

            <div className="controls">
                <button onClick={handlePrev}>⏮</button>
                <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
                <button onClick={handleNext}>⏭</button>
            </div>

            <div className="progress-bar" onClick={seek}>
                <div className="progress" style={{ width: `${progress}%` }} />
            </div>

            <div className="time-display">
                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}

export default MusicPlayer;
