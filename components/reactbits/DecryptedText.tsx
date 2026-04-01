'use client';

import { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    className?: string;
    parentClassName?: string;
    animateOn?: 'view' | 'hover';
}

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
    className = '',
    parentClassName = '',
    animateOn = 'view',
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startAnimation = () => {
        let iteration = 0;
        const targetText = text;

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText((prev) =>
                targetText
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return char;
                        if (iteration >= maxIterations) return targetText[index];
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            if (iteration >= maxIterations) {
                clearInterval(intervalRef.current!);
                setDisplayText(targetText);
            }

            iteration++;
        }, speed);
    };

    useEffect(() => {
        if (animateOn === 'view') {
            startAnimation();
        }
    }, [text]);

    return (
        <span
            className={parentClassName}
            onMouseEnter={() => {
                setIsHovering(true);
                if (animateOn === 'hover') startAnimation();
            }}
            onMouseLeave={() => setIsHovering(false)}
        >
            <span className={className}>{displayText}</span>
        </span>
    );
}
