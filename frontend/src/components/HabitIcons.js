import React from 'react';

// Custom humorous habit icons
export const AntiSocialMedia = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Facebook thumbs up - iconic and recognizable */}
    <path
      d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H7M7 22H18C19.1046 22 20 21.1046 20 20V13C20 11.8954 19.1046 11 18 11H7M7 11V7C7 5.89543 7.89543 5 9 5L12 2L13 7H18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      opacity="0.3"
    />
    {/* Large bold X over entire icon */}
    <path
      d="M2 2L22 22M22 2L2 22"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const AntiPhone = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Phone shape - filled for visibility */}
    <rect
      x="6"
      y="2"
      width="12"
      height="20"
      rx="2"
      fill="currentColor"
      opacity="0.3"
    />
    <rect
      x="6"
      y="2"
      width="12"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    {/* Large bold X across entire phone */}
    <path
      d="M3 3L21 21M21 3L3 21"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const AntiTV = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* TV screen - filled for clarity */}
    <rect
      x="2"
      y="7"
      width="20"
      height="13"
      rx="2"
      fill="currentColor"
      opacity="0.3"
    />
    <rect
      x="2"
      y="7"
      width="20"
      height="13"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Large bold X across TV */}
    <path
      d="M2 7L22 20M22 7L2 20"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const ProWorkout = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Larger, clearer dumbbell */}
    <rect x="2" y="4" width="5" height="4" rx="1" fill="currentColor" />
    <rect x="2" y="16" width="5" height="4" rx="1" fill="currentColor" />
    <rect x="17" y="4" width="5" height="4" rx="1" fill="currentColor" />
    <rect x="17" y="16" width="5" height="4" rx="1" fill="currentColor" />
    {/* Connecting bars */}
    <rect x="6" y="5.5" width="2" height="13" rx="0.5" fill="currentColor" />
    <rect x="16" y="5.5" width="2" height="13" rx="0.5" fill="currentColor" />
    {/* Center bar */}
    <rect x="8" y="10.5" width="8" height="3" rx="1" fill="currentColor" />
    {/* Checkmark for accomplishment */}
    <path
      d="M19 1L21 3L24 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProReading = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Open book - clearer and bolder */}
    <path
      d="M2 5C2 4 3 3 4 3H10C11 3 12 4 12 5M2 5V19C2 20 3 21 4 21H10C11 21 12 20 12 19M2 5V19M12 5C12 4 13 3 14 3H20C21 3 22 4 22 5M12 5V19C12 20 13 21 14 21H20C21 21 22 20 22 19V5M12 5V19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Pages for detail */}
    <line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="5" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="15" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="15" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const ProMeditation = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Head */}
    <circle cx="12" cy="6" r="3" fill="currentColor" />
    {/* Body in lotus position - clearer */}
    <ellipse cx="12" cy="16" rx="6" ry="4" fill="currentColor" opacity="0.4" />
    <path
      d="M12 10C10 10 8 11 7 13L6 18M12 10C14 11 16 11 17 13L18 18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arms in meditation pose */}
    <circle cx="6" cy="18" r="1.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
    {/* Simple zen circles above head */}
    <circle cx="12" cy="2" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="9" cy="1" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="15" cy="1" r="0.7" fill="currentColor" opacity="0.4" />
  </svg>
);

export const AntiJunkFood = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Hamburger - iconic junk food */}
    <ellipse cx="12" cy="8" rx="7" ry="2" fill="currentColor" opacity="0.4" />
    <path
      d="M5 8C5 6 8 4 12 4C16 4 19 6 19 8"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Patty */}
    <rect x="6" y="10" width="12" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
    {/* Cheese */}
    <rect x="6" y="13" width="12" height="2" fill="currentColor" opacity="0.4" />
    {/* Bottom bun */}
    <ellipse cx="12" cy="18" rx="7" ry="2.5" fill="currentColor" opacity="0.5" />
    <path
      d="M5 18C5 20 8 22 12 22C16 22 19 20 19 18"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Large bold X */}
    <path
      d="M2 2L22 22M22 2L2 22"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const ProWater = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Large water droplet - filled for clarity */}
    <path
      d="M12 2.5C12 2.5 6 9 6 14C6 17.5 8.5 20.5 12 20.5C15.5 20.5 18 17.5 18 14C18 9 12 2.5 12 2.5Z"
      fill="currentColor"
      opacity="0.3"
    />
    <path
      d="M12 2.5C12 2.5 6 9 6 14C6 17.5 8.5 20.5 12 20.5C15.5 20.5 18 17.5 18 14C18 9 12 2.5 12 2.5Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Water waves inside for clarity */}
    <path
      d="M8 13C9 13.5 10 14 11 14C12 14 13 13.5 14 13C15 12.5 16 12 17 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const ProSleep = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Crescent moon - clearer */}
    <path
      d="M21 12.79C20.09 13.55 18.95 14 17.69 14C14.36 14 11.64 11.28 11.64 7.95C11.64 6.69 12.09 5.55 12.85 4.64C8.17 5.13 4.5 9.06 4.5 13.86C4.5 18.95 8.55 23 13.64 23C18.44 23 22.37 19.33 22.86 14.65C22.5 14.8 22.1 14.9 21.7 14.9C21 14.9 21 13.8 21 12.79Z"
      fill="currentColor"
    />
    {/* Large Z's for sleep */}
    <path
      d="M15 2H20L15 7H20M17.5 8.5H21L17.5 12H21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProHydration = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Water bottle - filled for visibility */}
    <path
      d="M9 4H15M9 4V2H15V4M9 4V6C9 7 8 8 8 9V20C8 21 9 22 10 22H14C15 22 16 21 16 20V9C16 8 15 7 15 6V4"
      fill="currentColor"
      opacity="0.3"
    />
    <path
      d="M9 4H15M9 4V2H15V4M9 4V6C9 7 8 8 8 9V20C8 21 9 22 10 22H14C15 22 16 21 16 20V9C16 8 15 7 15 6V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Water level indicators */}
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    {/* Large checkmark for positive habit */}
    <path
      d="M17 1L19 3L23 -1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icon map for selection
export const habitIconMap = {
  AntiSocialMedia,
  AntiPhone,
  AntiTV,
  ProWorkout,
  ProReading,
  ProMeditation,
  AntiJunkFood,
  ProWater,
  ProSleep,
  ProHydration
};

export const availableHabitIcons = [
  { name: 'AntiSocialMedia', component: AntiSocialMedia, label: 'No Social Media' },
  { name: 'AntiPhone', component: AntiPhone, label: 'No Phone' },
  { name: 'AntiTV', component: AntiTV, label: 'No TV' },
  { name: 'ProWorkout', component: ProWorkout, label: 'Workout' },
  { name: 'ProReading', component: ProReading, label: 'Reading' },
  { name: 'ProMeditation', component: ProMeditation, label: 'Meditation' },
  { name: 'AntiJunkFood', component: AntiJunkFood, label: 'No Junk Food' },
  { name: 'ProWater', component: ProWater, label: 'Drink Water' },
  { name: 'ProSleep', component: ProSleep, label: 'Good Sleep' },
  { name: 'ProHydration', component: ProHydration, label: 'Stay Hydrated' }
];
