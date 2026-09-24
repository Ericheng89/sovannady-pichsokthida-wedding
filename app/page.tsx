"use client";

import {
  Music,
  VolumeX,
  ScrollText,
  MapPin,
  Images,
  MessageCircle,
} from "lucide-react";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [guestName, setGuestName] = useState("");

  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishes, setWishes] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

const galleryPhotos = [
  "/photo1.jpg",
  "/photo2.jpg",
  "/photo3.jpg",
  "/photo4.jpg",
  "/photo5.jpg",
];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  function handleTouchStart(
  event: React.TouchEvent<HTMLDivElement>
) {
  touchStartX.current =
    event.targetTouches[0].clientX;

  touchEndX.current = null;
}

function handleTouchMove(
  event: React.TouchEvent<HTMLDivElement>
) {
  touchEndX.current =
    event.targetTouches[0].clientX;
}

function handleTouchEnd() {
  if (
    touchStartX.current === null ||
    touchEndX.current === null
  ) {
    return;
  }

  const distance =
    touchStartX.current - touchEndX.current;

  const minimumSwipeDistance = 50;

  if (distance > minimumSwipeDistance) {
    nextPhoto();
  }

  if (distance < -minimumSwipeDistance) {
    previousPhoto();
  }

  touchStartX.current = null;
  touchEndX.current = null;
}

  const weddingDate = new Date("2026-11-16T17:00:00");

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openPhoto(index: number) {
  setSelectedPhoto(index);
}

function closePhoto() {
  setSelectedPhoto(null);
}

function nextPhoto() {
  setSelectedPhoto((current) => {
    if (current === null) return null;

    return (current + 1) % galleryPhotos.length;
  });
}

function previousPhoto() {
  setSelectedPhoto((current) => {
    if (current === null) return null;

    return (
      current - 1 + galleryPhotos.length
    ) % galleryPhotos.length;
  });
}

/* ========================================
   GALLERY KEYBOARD CONTROLS
======================================== */

useEffect(() => {
  if (selectedPhoto === null) return;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closePhoto();
    }

    if (event.key === "ArrowRight") {
      nextPhoto();
    }

    if (event.key === "ArrowLeft") {
      previousPhoto();
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedPhoto]);

useEffect(() => {
  if (selectedPhoto !== null) {
    document.body.style.overflow = "hidden";
  } else if (opened) {
    document.body.style.overflow = "";
  }

  return () => {
    if (opened) {
      document.body.style.overflow = "";
    }
  };
}, [selectedPhoto, opened]);

  /* ========================================
     GUEST NAME
  ======================================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("guest");

    if (guest) {
      setGuestName(decodeURIComponent(guest));
    }
  }, []);

  /* ========================================
     SCROLL REVEAL
  ======================================== */

  useEffect(() => {
    if (!opened) return;

    const elements = document.querySelectorAll(
  ".scroll-reveal, .gallery-reveal, .divider-reveal"
);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [opened]);

  /* ========================================
     PAGE SCROLL LOCK
  ======================================== */

  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  /* ========================================
     COUNTDOWN
  ======================================== */

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),

        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),

        minutes: Math.floor(
          (distance % (1000 * 60 * 60)) /
            (1000 * 60)
        ),

        seconds: Math.floor(
          (distance % (1000 * 60)) / 1000
        ),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ========================================
     FIREBASE WISHES
  ======================================== */

  useEffect(() => {
    const q = query(
      collection(db, "wishes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishes(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  /* ========================================
     OPEN INVITATION
  ======================================== */

  function handleOpen() {
  if (opening) return;

  setOpening(true);

  if (audioRef.current) {
    audioRef.current.currentTime = 2;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setMusicPlaying(true);
        })
        .catch((err) => {
          console.log("Audio play blocked:", err);
        });
    }
  }

  // Let the cinematic cover animation play first
  setTimeout(() => {
    setOpened(true);
    setOpening(false);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, 1200);
}

  /* ========================================
     MUSIC
  ======================================== */

  function toggleMusic() {
    if (!audioRef.current) return;

    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play();
      setMusicPlaying(true);
    }
  }

  /* ========================================
     SUBMIT WISH
  ======================================== */

  async function submitWish(e: React.FormEvent) {
    e.preventDefault();

    if (!wishName.trim() || !wishMessage.trim()) {
      alert("Please enter your name and message.");
      return;
    }

    await addDoc(collection(db, "wishes"), {
      name: wishName,
      message: wishMessage,
      createdAt: serverTimestamp(),
    });

    setWishName("");
    setWishMessage("");
  }

  return (
    <main className={opened ? "site-bg-inner" : "site-bg"}>
      <div
        className={opened ? "fixed-bg-inner" : "fixed-bg"}
      />

      {/* MUSIC */}

      <audio ref={audioRef} loop preload="auto">
        <source
          src="/Weddingsong.mp3"
          type="audio/mpeg"
        />
      </audio>

      <div
        className={
          opened
            ? "soft-overlay-inner"
            : "soft-overlay"
        }
      />

      {/* ========================================
          FALLING PETALS
      ======================================== */}

      <div className="petal petal1"></div>
      <div className="petal petal2"></div>
      <div className="petal petal3"></div>
      <div className="petal petal4"></div>
      <div className="petal petal5"></div>
      <div className="petal petal6"></div>
      <div className="petal petal7"></div>
      <div className="petal petal8"></div>
      <div className="petal petal9"></div>
      <div className="petal petal10"></div>
      <div className="petal petal11"></div>
      <div className="petal petal12"></div>
      <div className="petal petal13"></div>
      <div className="petal petal14"></div>
      <div className="petal petal15"></div>

      {/* ========================================
          AMBIENT WEDDING EFFECTS
      ======================================== */}

      <div
        className="ambient-effects"
        aria-hidden="true"
      >
        {/* SOFT BACKGROUND LIGHTS */}

        <div className="light-orb light-orb-1"></div>
        <div className="light-orb light-orb-2"></div>
        <div className="light-orb light-orb-3"></div>

        {/* GOLD DUST */}

        <div className="gold-dust dust-1"></div>
        <div className="gold-dust dust-2"></div>
        <div className="gold-dust dust-3"></div>
        <div className="gold-dust dust-4"></div>
        <div className="gold-dust dust-5"></div>
        <div className="gold-dust dust-6"></div>
        <div className="gold-dust dust-7"></div>
        <div className="gold-dust dust-8"></div>
        <div className="gold-dust dust-9"></div>
        <div className="gold-dust dust-10"></div>
        <div className="gold-dust dust-11"></div>
        <div className="gold-dust dust-12"></div>

        {/* TWINKLING STARS */}

        <div className="gold-sparkle sparkle-1">
          ✦
        </div>

        <div className="gold-sparkle sparkle-2">
          ✦
        </div>

        <div className="gold-sparkle sparkle-3">
          ✦
        </div>

        <div className="gold-sparkle sparkle-4">
          ✦
        </div>

        <div className="gold-sparkle sparkle-5">
          ✦
        </div>

        <div className="gold-sparkle sparkle-6">
          ✦
        </div>
      </div>

      {!opened ? (
        /* ========================================
           FRONT COVER
        ======================================== */

        <section
  className={`intro-wrap ${
    opening ? "invitation-opening" : ""
  }`}
>
          <div
  className={`intro-card fade-up ${
    opening ? "intro-card-opening" : ""
  }`}
>

            {/* KHMER WEDDING TITLE */}

            <h1 className="intro-khmer-title khmer-mool-title">
              សិរីមង្គលអាពាហ៍ពិពាហ៍
            </h1>

            {/* ENGLISH TITLE */}

            <p className="small-title">
              Wedding Ceremony
            </p>

            {/* WEDDING LOGO */}

            <img
              src="/DD.png"
              alt="Wedding Logo"
              className="monogram-logo"
            />

            {/* INVITATION TEXT */}

            <p className="intro-khmer-sub kh-main-font">
              សូមគោរពអញ្ជើញ
            </p>

            {/* GUEST NAME */}

            {guestName && (
              <div className="guest-name-wrap fade-up">
                <h2
                  className={`guest-name ${
                    /[\u1780-\u17FF]/.test(guestName)
                      ? "guest-name-khmer"
                      : "guest-name-english"
                  }`}
                >
                  {guestName}
                </h2>

                <img
                  src="/Gold Line Under Text.webp"
                  alt=""
                  className="guest-divider"
                />
              </div>
            )}

            {/* OPEN INVITATION */}

            <button
              className="open-frame-btn"
              onClick={handleOpen}
            >
              <img
                src="/Open Text Frame (1).png"
                alt="Open Invitation"
                className="open-frame-img"
              />
            </button>

            {/* CINEMATIC OPENING LIGHT */}

<div
  className={`opening-light ${
    opening ? "opening-light-active" : ""
  }`}
  aria-hidden="true"
/>
          </div>
        </section>
      ) : (
        /* ========================================
           MAIN INVITATION
        ======================================== */

        <section className="formal-invitation fade-up">
          <div className="formal-card">

            {/* ========================================
                QUICK NAVIGATION
            ======================================== */}

            <div className="quick-nav">
              <button
                onClick={() =>
                  scrollToSection("khmer")
                }
                aria-label="Invitation"
              >
                <ScrollText size={26} />
              </button>

              <button
                onClick={() =>
                  scrollToSection("location")
                }
                aria-label="Location"
              >
                <MapPin size={26} />
              </button>

              <button
                onClick={() =>
                  scrollToSection("gallery")
                }
                aria-label="Gallery"
              >
                <Images size={26} />
              </button>

              <button
                onClick={() =>
                  scrollToSection("wishes")
                }
                aria-label="Wishes"
              >
                <MessageCircle size={26} />
              </button>

              <button
  className={`music-btn ${
    musicPlaying ? "music-playing" : ""
  }`}
                onClick={toggleMusic}
                aria-label={
                  musicPlaying
                    ? "Pause music"
                    : "Play music"
                }
              >
                {musicPlaying ? (
                  <Music size={26} />
                ) : (
                  <VolumeX size={26} />
                )}
              </button>
            </div>

            {/* ========================================
                KHMER INVITATION
            ======================================== */}

            <div
              id="khmer"
              className="khmer-section scroll-reveal"
            >
              <h1 className="khmer-title kh-main-font">
                សិរីមង្គលអាពាហ៍ពិពាហ៍
              </h1>

              <div className="parents-grid">

                {/* GROOM PARENTS */}

                <div>
                  <p className="parent-label">
                    លោក
                  </p>

                  <h3 className="parent-name kh-main-font">
                    សឿន សុវណ្ណា
                  </h3>

                  <p className="parent-label">
                    លោកស្រី
                  </p>

                  <h3 className="parent-name kh-main-font">
                    ឡាំ សុខចេង
                  </h3>
                </div>

                {/* BRIDE PARENTS */}

                <div>
                  <p className="parent-label">
                    លោក
                  </p>

                  <h3 className="parent-name kh-main-font">
                    ជា វីរៈ
                  </h3>

                  <p className="parent-label">
                    លោកស្រី
                  </p>

                  <h3 className="parent-name kh-main-font">
                    ណុប នីលីន
                  </h3>
                </div>
              </div>

              <p className="invite-paragraph kh-main-font">
                មានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម
                លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា
                អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស
                ក្នុងពិធីមង្គលការកូនប្រុស កូនស្រី
                របស់យើងខ្ញុំ។
              </p>

              <div className="couple-section">

                {/* GROOM */}

                <div>
                  <p className="role kh-main-font">
                    កូនប្រុសនាម
                  </p>

                  <h2 className="person-name kh-main-font">
                    សឿន សុវណ្ណាឌី
                  </h2>
                </div>

                {/* LOGO */}

                <img
                  src="/DD.png"
                  alt="Wedding Logo"
                  className="center-logo"
                />

                {/* BRIDE */}

                <div>
                  <p className="role kh-main-font">
                    កូនស្រីនាម
                  </p>

                  <h2 className="person-name kh-main-font">
                    ជា ពេជ្រសុខធីតា
                  </h2>
                </div>
              </div>

              <p className="date-text kh-title-font">
                និងពិសាភោជនាហារដែលនឹងប្រព្រឹត្តទៅនៅ
                ថ្ងៃចន្ទ ៧កើត ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក
                ពុទ្ធសករាជ ២៥៧០
                ត្រូវនឹងថ្ងៃទី១៦ ខែវិច្ឆិកា ឆ្នាំ២០២៦
                វេលាម៉ោង ៥:០០ នាទីល្ងាច
                <br />
                នៅ ភោជនីយដ្ឋានឡាក់គីប្រាយ
                (អគារទាំងមូល)
              </p>
            </div>

            {/* ========================================
                ENGLISH INVITATION
            ======================================== */}

            <div className="english-section scroll-reveal">
              <h2 className="english-title">
                THE
                <br />
                WEDDING INVITATION
              </h2>

              <div className="english-parents-grid">
                <p>
                  Mr. SOEUN SOVANNA
                  <br />
                  Mrs. LAM SOKCHENG
                </p>

                <p>
                  <span>
                    Mr. CHEA VIRAK
                  </span>

                  <br />

                  <span className="nob-nilin">
                    Mrs. NOB NILIN
                  </span>
                </p>
              </div>

              <p className="english-invite-text">
                Request the Pleasure of your presence
                on this Auspicious Occasion
                <br />
                of the Wedding Reception of our
                Children.
              </p>

              <h2 className="english-couple-name">
                <span>
                  Soeun Sovannady
                </span>

                <span className="ampersand">
                  &
                </span>

                <span>
                  Chea Pichsokthida
                </span>
              </h2>

              <p className="english-date">
                on Monday 16<sup>th</sup> November
                2026 &nbsp; At 5:00 PM
                <br />
                at Lucky Bright Restaurant
                (Whole Building)
              </p>
            </div>

            {/* ========================================
                EVENT AGENDA
            ======================================== */}

            <div
              id="agenda"
              className="agenda-section scroll-reveal"
            >
              <h2 className="section-title kh-main-font">
                របៀបវារៈកម្មវិធី
              </h2>

              <p className="section-subtitle-en">
                EVENT AGENDA
              </p>

              <div className="agenda-card">
                <img
                  src="/Agenda.png"
                  alt="Wedding Event Agenda"
                  className="agenda-image"
                />
              </div>
            </div>

            {/* ========================================
                DRESS CODE
            ======================================== */}

            <div
              id="dress-code"
              className="dress-code-section scroll-reveal"
            >
              <img
                src="/Dress-Code.png"
                alt="Wedding Guest Dress Code"
                className="dress-code-image"
              />
            </div>

            {/* ========================================
                LOCATION
            ======================================== */}

            <div
              id="location"
              className="location-section scroll-reveal"
            >
              <h2 className="section-title kh-main-font">
                ទីតាំងកម្មវិធី
              </h2>

              <p className="section-subtitle-en">
                LOCATION
              </p>

              <div className="location-card">
                <img
                  src="/Map.png"
                  alt="Wedding Location"
                  className="location-image"
                />
              </div>

              <a
                className="save-btn"
                href="https://www.google.com/maps/search/?api=1&query=11.6260304,104.8878767"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="map-khmer">
                  បើកទីតាំងកម្មវិធី
                </span>

                <span className="map-english">
                  Open Google Map
                </span>
              </a>
            </div>

            {/* ========================================
                COUNTDOWN
            ======================================== */}

            <div
              id="countdown"
              className="countdown-section scroll-reveal"
            >
              <div className="countdown-title-wrap">
                <h2 className="section-title kh-main-font">
                  រាប់ថយក្រោយ
                </h2>

                <p className="section-subtitle-en">
                  COUNTDOWN
                </p>
              </div>

              {[
                {
                  label: "ថ្ងៃ",
                  en: "Days",
                  value: timeLeft.days,
                },
                {
                  label: "ម៉ោង",
                  en: "Hours",
                  value: timeLeft.hours,
                },
                {
                  label: "នាទី",
                  en: "Minutes",
                  value: timeLeft.minutes,
                },
                {
                  label: "វិនាទី",
                  en: "Seconds",
                  value: timeLeft.seconds,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="countdown-box"
                >
                  <h2>
                    {item.value}
                  </h2>

                  <p className="kh-main-font">
                    {item.label}
                  </p>

                  <span>
                    {item.en}
                  </span>
                </div>
              ))}
            </div>

            {/* ========================================
    PHOTO GALLERY
======================================== */}

<div
  id="gallery"
  className="gallery-section scroll-reveal"
>
  <h2 className="section-title kh-main-font">
    កម្រងរូបភាពអនុស្សាវរីយ៍
  </h2>

  <p className="section-subtitle-en">
    PHOTO GALLERY
  </p>

  <div className="gallery-grid">

    {galleryPhotos.map((photo, index) => (
      <div
        key={photo}
        className={`photo-card gallery-reveal ${
          index === 0 || index === 4
            ? "large-photo"
            : ""
        }`}
        onClick={() => openPhoto(index)}
        role="button"
        tabIndex={0}
        aria-label={`Open wedding photo ${
          index + 1
        }`}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            openPhoto(index);
          }
        }}
      >
        <img
          src={photo}
          alt={`Wedding photo ${index + 1}`}
        />

        <div className="gallery-photo-overlay">
          <span>View Photo</span>
        </div>
      </div>
    ))}

  </div>
</div>

            {/* ========================================
                APOLOGY
            ======================================== */}

            <div className="apology-section scroll-reveal">
              <h2 className="apology-title kh-main-font">
                សេចក្តីសូមអភ័យទោស
              </h2>

              <p className="apology-kh kh-title-font">
                យើងខ្ញុំសូមមេត្តាអធ្យាស្រ័យ និងអភ័យទោសពីសំណាក់
                ឯកឧត្តម អ្នកឧកញ៉ា ឧកញ៉ា លោកជំទាវ លោក លោកស្រី
                អ្នកនាង កញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់
                ដោយយើងខ្ញុំពុំបានគោរពជូនលិខិតអញ្ជើញដោយផ្ទាល់។
                យើងខ្ញុំសង្ឃឹមថាភ្ញៀវកិត្តិយសទាំងអស់
                នឹងអញ្ជើញចូលរួមក្នុងកម្មវិធីរបស់យើងខ្ញុំជាក់ជាមិនខាន។
              </p>

              <div className="apology-divider">
                ✦
              </div>

              <h3 className="apology-en-title">
                OUR APOLOGY
              </h3>

              <p className="apology-en">
                We sincerely apologize and ask for the kind understanding
                of all our honored guests, as we were unable to personally
                deliver this invitation to you. We sincerely hope that you
                will honor us with your presence and join us in celebrating
                our wedding.
              </p>
            </div>

            {/* ========================================
                DIVIDER — APOLOGY / GRATITUDE
            ======================================== */}

            <div className="apology-gratitude-divider divider-reveal"></div>

            {/* ========================================
                GRATITUDE
            ======================================== */}

            <div className="gratitude-section scroll-reveal">
              <h2 className="gratitude-title kh-main-font">
                សេចក្តីថ្លែងអំណរគុណ
              </h2>

              <p className="gratitude-kh kh-title-font">
                យើងខ្ញុំ សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ
                ចំពោះ ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា
                លោក លោកស្រី អ្នកនាងកញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់
                ដែលបានចូលរួមជាកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។
              </p>

              <div className="gratitude-divider">
                ✦
              </div>

              <h3 className="gratitude-en-title">
                OUR GRATITUDE
              </h3>

              <p className="gratitude-en">
                We are deeply grateful to H.E., Lok Neak Oknha,
                Neak Oknha, Oknha, Lct., ladies and gentlemen,
                for honoring us with your presence at our upcoming
                wedding ceremony.
              </p>
            </div>

            {/* ========================================
                WISHES
            ======================================== */}

            <div
              id="wishes"
              className="wishes-section scroll-reveal"
            >
              <h2 className="section-title kh-title-font">
                សារជូនពរ
              </h2>

              <p className="section-subtitle-en">
                Leave Your Wishes
              </p>

              <form
                className="wish-form"
                onSubmit={submitWish}
              >
                <input
                  value={wishName}
                  onChange={(e) =>
                    setWishName(e.target.value)
                  }
                  placeholder="Your name"
                  className="wish-input"
                />

                <textarea
                  value={wishMessage}
                  onChange={(e) =>
                    setWishMessage(e.target.value)
                  }
                  placeholder="Write your wishes..."
                  className="wish-textarea"
                  rows={4}
                />

                <button
                  className="main-btn"
                  type="submit"
                >
                  Send Wishes
                </button>
              </form>

              <div className="wish-list">
                {wishes.map((wish) => (
                  <div
                    className="wish-card"
                    key={wish.id}
                  >
                    <h3>
                      {wish.name}
                    </h3>

                    <p>
                      {wish.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

                    </div>
        </section>
      )}

      {/* ========================================
          FULLSCREEN PHOTO GALLERY
      ======================================== */}

      {selectedPhoto !== null && (
        <div
          className="gallery-lightbox"
          onClick={closePhoto}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* CLOSE */}

          <button
            className="lightbox-close"
            onClick={closePhoto}
            aria-label="Close gallery"
          >
            ×
          </button>

          {/* PHOTO COUNTER */}

          <div className="lightbox-counter">
            {selectedPhoto + 1} / {galleryPhotos.length}
          </div>

          {/* PREVIOUS */}

          <button
            className="lightbox-arrow lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              previousPhoto();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>

          {/* IMAGE */}

          <div
            className="lightbox-image-wrap"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              key={galleryPhotos[selectedPhoto]}
              src={galleryPhotos[selectedPhoto]}
              alt={`Wedding photo ${
                selectedPhoto + 1
              }`}
              className="lightbox-image"
            />
          </div>

          {/* NEXT */}

          <button
            className="lightbox-arrow lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              nextPhoto();
            }}
            aria-label="Next photo"
          >
            ›
          </button>

          {/* MOBILE SWIPE HINT */}

          <div className="lightbox-swipe-hint">
            Swipe to browse
          </div>

        </div>
      )}

    </main>
  );
}