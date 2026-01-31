import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Pipette, Hash } from 'lucide-react';

const PRESET_COLORS = [
    '#000000', '#444444', '#888888', '#CCCCCC', '#FFFFFF',
    '#EF4444', '#F87171', '#FCA5A5',
];

// Helper functions for color conversion
function hexToHsv(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s /= 100;
    v /= 100;

    if (s === 0) {
        r = g = b = v;
    } else {
        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));
        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            default: r = v; g = p; b = q;
        }
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

const ColorPicker = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputColor, setInputColor] = useState(value);
    
    // HSV State
    const [hue, setHue] = useState(0);
    const [sat, setSat] = useState(0);
    const [val, setVal] = useState(100);

    const containerRef = useRef(null);
    const nativeInputRef = useRef(null);
    const spectrumRef = useRef(null);
    const hueRef = useRef(null);

    // Sync external value to internal state
    useEffect(() => {
        setInputColor(value);
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            const { h, s, v } = hexToHsv(value);
            setHue(h);
            setSat(s);
            setVal(v);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Interaction Handlers ---

    const handleSpectrumMove = (e) => {
        if (!spectrumRef.current) return;
        const rect = spectrumRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        
        const newSat = x * 100;
        const newVal = 100 - (y * 100);
        
        setSat(newSat);
        setVal(newVal);
        const newHex = hsvToHex(hue, newSat, newVal);
        onChange(newHex);
    };

    const handleHueMove = (e) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newHue = x * 360;
        setHue(newHue);
        const newHex = hsvToHex(newHue, sat, val);
        onChange(newHex);
    };

    const startDrag = (e, callback) => {
        e.preventDefault();
        callback(e);
        const moveHandler = (event) => callback(event);
        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    };

    const handleHexChange = (e) => {
        const val = e.target.value;
        setInputColor(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            onChange(val);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 hover:shadow-sm transition group"
            >
                <div 
                    className="w-8 h-8 rounded border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: value }}
                ></div>
                <span className="text-sm font-mono text-gray-600 flex-1 uppercase">{value}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full text-left left-0 mt-2 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in origin-top-left">
                     
                     {/* Spectrum Area */}
                     <div 
                        className="w-full h-32 rounded-lg mb-3 relative cursor-crosshair overflow-hidden shadow-inner border border-gray-200"
                        ref={spectrumRef}
                        style={{
                            backgroundColor: `hsl(${hue}, 100%, 50%)`,
                            backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)`
                        }}
                        onMouseDown={(e) => startDrag(e, handleSpectrumMove)}
                     >
                        <div 
                            className="w-3 h-3 rounded-full border-2 border-white shadow-md absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ 
                                left: `${sat}%`, 
                                top: `${100 - val}%`,
                                backgroundColor: value
                            }}
                        ></div>
                     </div>

                     {/* Hue Slider */}
                     <div 
                        className="w-full h-3 rounded-full mb-4 relative cursor-pointer border border-gray-200"
                        ref={hueRef}
                        style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                        onMouseDown={(e) => startDrag(e, handleHueMove)}
                     >
                        <div 
                            className="w-3 h-3 bg-white rounded-full border border-gray-300 shadow absolute top-0 -translate-x-1/2 pointer-events-none"
                            style={{ left: `${(hue / 360) * 100}%` }}
                        ></div>
                     </div>

                     {/* Hex Input */}
                     <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text"
                                value={inputColor.replace('#', '')}
                                onChange={(e) => handleHexChange({ target: { value: '#' + e.target.value } })}
                                className="w-full pl-8 pr-2 py-1.5 text-sm uppercase font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                maxLength={6}
                            />
                        </div>
                         <button 
                            onClick={() => nativeInputRef.current?.click()}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                            title="System Color Picker"
                         >
                             <Pipette size={18} />
                         </button>
                         <input 
                            ref={nativeInputRef}
                            type="color" 
                            value={value}
                            onChange={(e) => { onChange(e.target.value); setInputColor(e.target.value); }}
                            className="hidden"
                        />
                    </div>

                    {/* Presets */}
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Presets</span>
                        <div className="grid grid-cols-8 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => { onChange(color); setInputColor(color); }}
                                    className="w-5 h-5 rounded-full border border-black/5 hover:scale-125 hover:shadow-md transition-all relative group/color"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                >
                                    {value.toLowerCase() === color.toLowerCase() && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
