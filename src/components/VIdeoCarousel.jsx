import { useEffect, useRef } from "react";
import { hightlightsSlides } from "../constants";
import { useState } from "react";
import { pauseImg, playImg, replayImg } from "../utils";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const VIdeoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setvideo] = useState({
    isPlaying: false,
    isEnd: false,
    videoId: 0,
    isLastVideo: false,
    startPlay: false,
  });
  const [loadingData, setloadingData] = useState([]);

  const { isPlaying, isEnd, videoId, isLastVideo, startPlay } = video;
  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%) `,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setvideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);
  useEffect(() => {
    if (loadingData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId]?.pause();
      } else {
        startPlay && videoRef.current[videoId]?.play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadingData]);
  const handleLoadedMetaData = (i, e) => setloadingData((pre) => [...pre, e]);
  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;
    if (span[videoId]) {
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);
          if (progress != currentProgress) {
            currentProgress = progress;
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1280
                  ? "10vw"
                  : "4vw",
            });
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (videoId === 0) {
        anim.restart();
      }
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };
      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay, isPlaying]);
  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end": {
        const nextId = i + 1;
        if (nextId < hightlightsSlides.length) {
          setvideo((pre) => ({
            ...pre,
            isEnd: true,
            videoId: nextId,
          }));
        } else {
          setvideo((pre) => ({
            ...pre,
            isLastVideo: true,
          }));
        }
        break;
      }
      case "video-last":
        setvideo((pre) => ({
          ...pre,
          isLastVideo: true,
        }));
        break;
      case "video-reset":
        setvideo((pre) => ({
          ...pre,
          isLastVideo: false,
          videoId: 0,
        }));
        break;
      case "play":
        setvideo((pre) => ({
          ...pre,
          isPlaying: !pre.isPlaying,
        }));
        break;

      case "pause":
        setvideo((pre) => ({
          ...pre,
          isPlaying: !pre.isPlaying,
        }));
        break;
      default:
        return video;
    }
  };
  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3x1 overflow-hidden bg-black">
                <video
                  id="video"
                  playsInline={true}
                  preload="auto"
                  muted
                  className={`${
                    list.id === 2 && "translate-x-44"
                  }pointer-events-none`}
                  ref={(el) => (videoRef.current[i] = el)}
                  onPlay={() =>
                    setvideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }))
                  }
                  onEnded={() =>
                    i !== 3
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                >
                  <source src={list.video} type="video/mp4"></source>
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text) => (
                  <p key={text} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 rounded-full bg-gray-300 backdrop:blur">
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              onClick={() => {
                if (!isLastVideo) {
                  ("");
                } else {
                  setvideo((pre) => ({
                    ...pre,
                    videoId: i,
                    isLastVideo: false,
                  }));
                }
              }}
            >
              <span
                className="absolute w-full h-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        <button className="control-button">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : () => handleProcess("play")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VIdeoCarousel;
