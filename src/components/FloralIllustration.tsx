import React from 'react';

type FloralIllustrationProps = {
  type: 
    | 'bouquet-rose'
    | 'bouquet-lily'
    | 'papan-selamat'
    | 'papan-duka'
    | 'wisuda-teddy'
    | 'wisuda-sunflower'
    | 'wedding-bridal'
    | 'hamper-deluxe'
    | 'hamper-fruit';
  className?: string;
};

export const FloralIllustration: React.FC<FloralIllustrationProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'bouquet-rose':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#FDF8F5] via-[#F9EFEA] to-[#F1DED6] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-4 drop-shadow-sm">
            {/* Background ambient foliage */}
            <g opacity="0.85">
              {/* Eucalyptus leaves */}
              <path d="M120 180 C100 140 130 90 170 110 C160 140 140 170 120 180 Z" fill="#7D9D8B" />
              <path d="M280 180 C300 140 270 90 230 110 C240 140 260 170 280 180 Z" fill="#6E8E7D" />
              <path d="M150 100 C130 60 170 30 190 60 C180 80 165 95 150 100 Z" fill="#8FAFA0" />
              <path d="M250 100 C270 60 230 30 210 60 C220 80 235 95 250 100 Z" fill="#8FAFA0" />
            </g>

            {/* Baby's breath sprinkles */}
            <g fill="#FFF">
              <circle cx="160" cy="85" r="3.5" />
              <circle cx="175" cy="75" r="3" />
              <circle cx="230" cy="80" r="3.5" />
              <circle cx="245" cy="72" r="3" />
              <circle cx="200" cy="65" r="4" />
              <circle cx="130" cy="120" r="3" />
              <circle cx="270" cy="120" r="3" />
            </g>

            {/* Korean Wrap paper cones */}
            <path d="M130 290 L80 150 C110 140 160 160 200 155 C240 160 290 140 320 150 L270 290 Z" fill="#D8C7B8" />
            <path d="M140 290 L110 160 C140 170 180 165 200 165 C220 165 260 170 290 160 L260 290 Z" fill="#E8DDD2" />

            {/* Central Roses Cluster */}
            {/* Center Rose */}
            <circle cx="200" cy="120" r="34" fill="#E07A70" />
            <path d="M190 105 C205 95 220 105 215 125 C210 135 190 135 185 120 C180 105 195 95 205 110" stroke="#FFF" strokeWidth="2.5" fill="#D3645A" />
            <circle cx="202" cy="118" r="16" fill="#BC473E" />
            <path d="M196 112 C204 110 208 116 206 122" stroke="#FFF" strokeWidth="2" fill="none" />

            {/* Left Rose */}
            <circle cx="155" cy="140" r="28" fill="#F4A59D" />
            <circle cx="155" cy="138" r="14" fill="#E07A70" />
            <path d="M148 132 C156 128 162 135 159 142" stroke="#FFF" strokeWidth="2" fill="none" />

            {/* Right Rose */}
            <circle cx="245" cy="140" r="28" fill="#F4A59D" />
            <circle cx="245" cy="138" r="14" fill="#E07A70" />
            <path d="M238 132 C246 128 252 135 249 142" stroke="#FFF" strokeWidth="2" fill="none" />

            {/* Top Rose */}
            <circle cx="200" cy="85" r="22" fill="#F7C1BB" />
            <circle cx="200" cy="84" r="10" fill="#E07A70" />

            {/* Satin Ribbon & Bow */}
            <path d="M175 250 Q200 240 225 250 Q215 265 200 255 Q185 265 175 250 Z" fill="#8B2635" />
            <path d="M175 250 C150 240 145 270 170 260 C185 255 190 250 175 250 Z" fill="#A83244" />
            <path d="M225 250 C250 240 255 270 230 260 C215 255 210 250 225 250 Z" fill="#A83244" />
            <path d="M195 258 L180 305 L195 300 L200 260 Z" fill="#8B2635" />
            <path d="M205 258 L220 305 L205 300 L200 260 Z" fill="#8B2635" />
          </svg>
        </div>
      );

    case 'papan-selamat':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#FEF9E7] to-[#F7EAC7] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-3 drop-shadow-sm">
            {/* Wooden tripod stand */}
            <path d="M70 300 L110 150 M330 300 L290 150 M200 300 L200 180" stroke="#795548" strokeWidth="7" strokeLinecap="round" />
            
            {/* Main Papan Styrofoam Frame */}
            <rect x="45" y="45" width="310" height="175" rx="6" fill="#1565C0" stroke="#0D47A1" strokeWidth="4" />
            {/* Yellow inner decorative banner border */}
            <rect x="55" y="55" width="290" height="155" rx="4" fill="#0D47A1" stroke="#FFD54F" strokeWidth="3" strokeDasharray="6 4" />

            {/* Floral garland header border (Bunga Suyok) */}
            <g>
              {[60, 95, 130, 165, 200, 235, 270, 305, 340].map((x, i) => (
                <circle key={`top-${i}`} cx={x} cy="52" r="8" fill={i % 2 === 0 ? '#E91E63' : '#FFEB3B'} />
              ))}
              {[60, 95, 130, 165, 200, 235, 270, 305, 340].map((x, i) => (
                <circle key={`bot-${i}`} cx={x} cy="212" r="8" fill={i % 2 === 0 ? '#FF9800' : '#4CAF50'} />
              ))}
              {[80, 115, 150, 185].map((y, i) => (
                <circle key={`left-${i}`} cx="50" cy={y} r="8" fill={i % 2 === 0 ? '#FFEB3B' : '#E91E63'} />
              ))}
              {[80, 115, 150, 185].map((y, i) => (
                <circle key={`right-${i}`} cx="350" cy={y} r="8" fill={i % 2 === 0 ? '#FFEB3B' : '#E91E63'} />
              ))}
            </g>

            {/* Text simulation (Bunga Suyok Lettering) */}
            <text x="200" y="95" textAnchor="middle" fill="#FFEB3B" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="2">
              SELAMAT & SUKSES
            </text>
            <rect x="100" y="108" width="200" height="2" fill="#FFC107" />
            <text x="200" y="132" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">
              ATAS PERESMIAN KANTOR BARU
            </text>
            <text x="200" y="152" textAnchor="middle" fill="#81D4FA" fontSize="11" fontFamily="system-ui, sans-serif">
              DI KOTA JAMBI
            </text>
            <rect x="90" y="165" width="220" height="26" rx="4" fill="#FFD54F" />
            <text x="200" y="183" textAnchor="middle" fill="#0D47A1" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif">
              DARI: KELUARGA BESAR MITRA
            </text>
          </svg>
        </div>
      );

    case 'papan-duka':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-3 drop-shadow-sm">
            {/* Wooden tripod stand */}
            <path d="M70 300 L110 150 M330 300 L290 150 M200 300 L200 180" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" />
            
            {/* Main Papan Frame (Solemn Black / Dark Slate) */}
            <rect x="45" y="45" width="310" height="175" rx="6" fill="#1F2937" stroke="#111827" strokeWidth="4" />
            <rect x="55" y="55" width="290" height="155" rx="4" fill="#111827" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6 4" />

            {/* Floral garland header border (White, Yellow, Purple) */}
            <g>
              {[60, 95, 130, 165, 200, 235, 270, 305, 340].map((x, i) => (
                <circle key={`top-d-${i}`} cx={x} cy="52" r="8" fill={i % 2 === 0 ? '#FFFFFF' : '#FDE047'} />
              ))}
              {[60, 95, 130, 165, 200, 235, 270, 305, 340].map((x, i) => (
                <circle key={`bot-d-${i}`} cx={x} cy="212" r="8" fill={i % 2 === 0 ? '#FFFFFF' : '#A855F7'} />
              ))}
            </g>

            {/* Text simulation */}
            <text x="200" y="95" textAnchor="middle" fill="#F9FAFB" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
              TURUT BERDUKA CITA
            </text>
            <rect x="110" y="108" width="180" height="2" fill="#6B7280" />
            <text x="200" y="135" textAnchor="middle" fill="#E5E7EB" fontSize="12" fontFamily="serif" fontStyle="italic">
              Atas Wafatnya Almarhum / Almarhumah
            </text>
            <rect x="85" y="162" width="230" height="26" rx="4" fill="#374151" stroke="#4B5563" />
            <text x="200" y="180" textAnchor="middle" fill="#F3F4F6" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
              DARI: SAHABAT & REKAN KERJA
            </text>
          </svg>
        </div>
      );

    case 'wisuda-teddy':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-4 drop-shadow-sm">
            {/* Wrapping Cone */}
            <path d="M120 300 L70 170 C110 160 160 175 200 170 C240 175 290 160 330 170 L280 300 Z" fill="#1E293B" />
            <path d="M135 300 L100 175 C140 185 180 180 200 180 C220 180 260 185 300 175 L265 300 Z" fill="#334155" />

            {/* Sunflowers background */}
            <g>
              {/* Left Sunflower */}
              <circle cx="130" cy="120" r="32" fill="#F59E0B" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <ellipse key={`s1-${deg}`} cx="130" cy="120" rx="6" ry="24" fill="#FBBF24" transform={`rotate(${deg} 130 120)`} />
              ))}
              <circle cx="130" cy="120" r="16" fill="#78350F" />

              {/* Right Sunflower */}
              <circle cx="270" cy="120" r="32" fill="#F59E0B" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <ellipse key={`s2-${deg}`} cx="270" cy="120" rx="6" ry="24" fill="#FBBF24" transform={`rotate(${deg} 270 120)`} />
              ))}
              <circle cx="270" cy="120" r="16" fill="#78350F" />
            </g>

            {/* Cute Teddy Bear with Graduation Cap */}
            <g transform="translate(145, 65)">
              {/* Teddy Ears */}
              <circle cx="20" cy="30" r="14" fill="#B45309" />
              <circle cx="20" cy="30" r="8" fill="#FDE68A" />
              <circle cx="90" cy="30" r="14" fill="#B45309" />
              <circle cx="90" cy="30" r="8" fill="#FDE68A" />

              {/* Teddy Head */}
              <circle cx="55" cy="55" r="38" fill="#D97706" />
              {/* Snout */}
              <ellipse cx="55" cy="65" rx="16" ry="12" fill="#FEF3C7" />
              <ellipse cx="55" cy="60" rx="5" ry="4" fill="#78350F" />
              {/* Eyes */}
              <circle cx="42" cy="52" r="3.5" fill="#1E293B" />
              <circle cx="68" cy="52" r="3.5" fill="#1E293B" />

              {/* Graduation Cap (Toga) */}
              <polygon points="55,10 95,26 55,42 15,26" fill="#0F172A" />
              <polygon points="35,28 75,28 70,38 40,38" fill="#1E293B" />
              <circle cx="55" cy="26" r="3" fill="#F59E0B" />
              <path d="M55 26 Q75 30 80 48" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* Diploma scroll in arm */}
              <rect x="75" y="80" width="22" height="8" rx="2" fill="#FFF" stroke="#DC2626" strokeWidth="1.5" />
            </g>

            {/* Ribbon on bouquet */}
            <path d="M175 255 Q200 245 225 255 Q215 270 200 260 Q185 270 175 255 Z" fill="#F59E0B" />
            <circle cx="200" cy="255" r="6" fill="#D97706" />
          </svg>
        </div>
      );

    case 'wedding-bridal':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-4 drop-shadow-sm">
            {/* Satin ribbon tails hanging down */}
            <path d="M190 220 Q170 260 160 310" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
            <path d="M210 220 Q230 260 240 310" stroke="#F1F5F9" strokeWidth="12" strokeLinecap="round" opacity="0.9" />

            {/* Lush White Roses and Lily Petals */}
            <g>
              {/* Eucalyptus & Sage Greenery */}
              <path d="M140 140 C100 120 120 70 170 90 Z" fill="#94A3B8" />
              <path d="M260 140 C300 120 280 70 230 90 Z" fill="#94A3B8" />

              {/* White Lily star shape */}
              <g transform="translate(145, 60)">
                <path d="M55 20 Q65 45 95 50 Q65 55 55 80 Q45 55 15 50 Q45 45 55 20 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="55" cy="50" r="5" fill="#FEF08A" />
              </g>

              {/* Avalanche White Roses */}
              <circle cx="150" cy="145" r="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              <circle cx="150" cy="145" r="16" fill="#F8FAFC" />
              <path d="M142 140 C150 135 158 142 154 150" stroke="#CBD5E1" strokeWidth="2" fill="none" />

              <circle cx="250" cy="145" r="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              <circle cx="250" cy="145" r="16" fill="#F8FAFC" />
              <path d="M242 140 C250 135 258 142 254 150" stroke="#CBD5E1" strokeWidth="2" fill="none" />

              {/* Center Rose */}
              <circle cx="200" cy="155" r="36" fill="#FFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="200" cy="155" r="18" fill="#F1F5F9" />
              <path d="M192 148 C202 142 210 152 205 160" stroke="#94A3B8" strokeWidth="2.5" fill="none" />
            </g>

            {/* Pearl pin stem wrap */}
            <rect x="185" y="195" width="30" height="40" rx="3" fill="#E2E8F0" />
            <circle cx="200" cy="205" r="3" fill="#FFFFFF" stroke="#CBD5E1" />
            <circle cx="200" cy="215" r="3" fill="#FFFFFF" stroke="#CBD5E1" />
            <circle cx="200" cy="225" r="3" fill="#FFFFFF" stroke="#CBD5E1" />
          </svg>
        </div>
      );

    case 'hamper-fruit':
    case 'hamper-deluxe':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#ECFDF5] via-[#F0FDF4] to-[#DCFCE7] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-4 drop-shadow-sm">
            {/* Woven Basket Handle */}
            <path d="M120 180 C120 70 280 70 280 180" stroke="#A16207" strokeWidth="8" fill="none" strokeLinecap="round" />

            {/* Fresh Fruits inside basket */}
            {/* Fuji Apple (Red) */}
            <circle cx="160" cy="165" r="24" fill="#DC2626" />
            <path d="M160 141 Q165 130 172 135" stroke="#15803D" strokeWidth="2" fill="none" />

            {/* Century Pear (Gold/Yellow) */}
            <circle cx="240" cy="165" r="24" fill="#FBBF24" />
            <circle cx="240" cy="155" r="16" fill="#F59E0B" />

            {/* Grapes Cluster (Purple) */}
            <g fill="#7C3AED">
              <circle cx="190" cy="150" r="10" />
              <circle cx="210" cy="150" r="10" />
              <circle cx="200" cy="165" r="10" />
              <circle cx="185" cy="165" r="9" />
              <circle cx="215" cy="165" r="9" />
              <circle cx="200" cy="180" r="8" />
            </g>

            {/* Fresh Orchid & Flowers emerging */}
            <g transform="translate(130, 95)">
              <circle cx="25" cy="25" r="14" fill="#F472B6" />
              <circle cx="25" cy="25" r="6" fill="#FDF2F8" />
              <circle cx="5" cy="15" r="8" fill="#EC4899" />
              <circle cx="45" cy="15" r="8" fill="#EC4899" />
            </g>
            <g transform="translate(210, 95)">
              <circle cx="25" cy="25" r="14" fill="#F472B6" />
              <circle cx="25" cy="25" r="6" fill="#FDF2F8" />
              <circle cx="5" cy="15" r="8" fill="#EC4899" />
              <circle cx="45" cy="15" r="8" fill="#EC4899" />
            </g>

            {/* Woven Rotan Basket Body */}
            <path d="M100 180 L120 280 Q200 295 280 280 L300 180 Z" fill="#CA8A04" stroke="#854D0E" strokeWidth="3" />
            {/* Basket weave pattern lines */}
            <path d="M110 205 Q200 215 290 205 M115 235 Q200 245 285 235 M120 265 Q200 275 280 265" stroke="#854D0E" strokeWidth="2" strokeDasharray="6 3" />

            {/* Big Green/Gold ribbon bow */}
            <g transform="translate(175, 175)">
              <circle cx="25" cy="15" r="8" fill="#15803D" />
              <path d="M25 15 C0 5 0 35 25 20 Z" fill="#16A34A" />
              <path d="M25 15 C50 5 50 35 25 20 Z" fill="#16A34A" />
            </g>
          </svg>
        </div>
      );

    case 'bouquet-lily':
    default:
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#F7FEE7] to-[#ECFCCB] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain p-4 drop-shadow-sm">
            <path d="M130 290 L90 160 C120 150 160 165 200 160 C240 165 280 150 310 160 L270 290 Z" fill="#D4D4D8" />
            <path d="M145 290 L120 170 C150 175 180 170 200 170 C220 170 250 175 280 170 L255 290 Z" fill="#F4F4F5" />
            
            {/* Lily flowers */}
            <g transform="translate(150, 70)">
              <path d="M50 10 Q65 40 100 45 Q65 50 50 80 Q35 50 0 45 Q35 40 50 10 Z" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="2" />
              <circle cx="50" cy="45" r="6" fill="#FACC15" />
            </g>
            <g transform="translate(100, 110)">
              <path d="M40 10 Q50 35 80 40 Q50 45 40 70 Q30 45 0 40 Q30 35 40 10 Z" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="5" fill="#FACC15" />
            </g>
            <g transform="translate(220, 110)">
              <path d="M40 10 Q50 35 80 40 Q50 45 40 70 Q30 45 0 40 Q30 35 40 10 Z" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="5" fill="#FACC15" />
            </g>

            {/* Ribbon */}
            <path d="M175 250 Q200 240 225 250 Q215 265 200 255 Q185 265 175 250 Z" fill="#15803D" />
            <circle cx="200" cy="250" r="5" fill="#166534" />
          </svg>
        </div>
      );
  }
};
