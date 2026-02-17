import { useState, useRef } from "react";
import { Play, Pause, VolumeX, Volume2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

import ciroBareback1 from "@/assets/videos/ciro-bareback-join-up.mp4";
import ciroBareback2 from "@/assets/videos/ciro-bareback-join-up-2.mp4";
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";
import faqLesson from "@/assets/videos/faq-lesson-session.mp4";
import faqRidingGear from "@/assets/videos/faq-riding-gear.mp4";
import faqTrialLesson from "@/assets/videos/faq-trial-lesson.mp4";

import ciroWithHorse from "@/assets/ciro-with-horse.png";
import ciroWide from "@/assets/ciro-wide.png";

interface TeamVideo {
  id: string;
  name: string;
  role: string;
  video: string;
  poster: string;
  badge?: string;
}

const teamVideos: TeamVideo[] = [
  {
    id: "ciro-bareback",
    name: "Ciro Parisella",
    role: "Founder & Builder-Rider",
    video: ciroBareback1,
    poster: ciroWithHorse,
    badge: "Founder",
  },
  {
    id: "ciro-horsemanship",
    name: "Ciro Parisella",
    role: "Natural Horsemanship",
    video: ciroBareback2,
    poster: ciroWide,
    badge: "Horsemanship",
  },
  {
    id: "lesson-session",
    name: "Glenn",
    role: "Head Trainer",
    video: faqLesson,
    poster: ciroWithHorse,
    badge: "Trainer",
  },
  {
    id: "slow-mo-action",
    name: "The Team",
    role: "In Action",
    video: slowMo1,
    poster: ciroWide,
  },
  {
    id: "riding-gear",
    name: "The Team",
    role: "Gear & Preparation",
    video: faqRidingGear,
    poster: ciroWithHorse,
  },
  {
    id: "trial-lesson",
    name: "The Team",
    role: "Trial Lesson Day",
    video: faqTrialLesson,
    poster: ciroWide,
  },
];

function TeamVideoCard({ member }: { member: TeamVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: cardRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card card-hover-glow transition-all duration-600",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      {/* Video */}
      <div className="relative aspect-[3/4] cursor-pointer overflow-hidden" onClick={togglePlay}>
        {!isPlaying && (
          <div className="absolute inset-0 z-10">
            <img src={member.poster} alt={member.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="h-6 w-6 text-accent-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={member.video}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          onEnded={() => setIsPlaying(false)}
        />

        {/* Controls overlay when playing */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
                aria-label="Pause"
              >
                <Pause className="h-4 w-4 text-primary-foreground" />
              </button>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-primary-foreground" /> : <Volume2 className="h-4 w-4 text-primary-foreground" />}
              </button>
            </div>
          </div>
        )}

        {/* Badge */}
        {member.badge && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
              {member.badge}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">{member.name}</h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{member.role}</p>
      </div>
    </div>
  );
}

export function MeetTheTeamGallery() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center max-w-2xl mx-auto mb-14 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className={cn(
            "w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100",
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          )} />
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Users className="h-5 w-5 text-accent" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm">Behind the Scenes</p>
          </div>
          <h2 className="heading-section text-foreground mb-4">Meet the Team</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Get to know the people behind Peninsula Equine — from Ciro's natural horsemanship 
            to our trainers and crew in action.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamVideos.map((member) => (
            <TeamVideoCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
