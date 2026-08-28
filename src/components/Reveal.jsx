import React, { useEffect, useRef, useState } from 'react';

/**
 * Envuelve a sus hijos y los anima con un fade + slide la primera vez que
 * entran en el viewport. Si ya están visibles al montar (ej. el hero de la
 * página), la animación corre casi de inmediato, dando el efecto de
 * "carga con animación". Una vez revelado, no vuelve a ocultarse al salir
 * de vista (evita parpadeos si el usuario sube y baja con el scroll).
 *
 * No agrega dependencias nuevas: usa IntersectionObserver + clases de
 * Tailwind ya disponibles en el proyecto (opacity-*, translate-*,
 * transition-all).
 */
const Reveal = ({
    children,
    className = '',
    direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
    delay = 0,
    duration = 700,
    threshold = 0.15,
    as: Tag = 'div',
    ...rest
}) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            // Entorno sin soporte (SSR, navegadores muy viejos): mostrar directo.
            setVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.unobserve(node);
                    }
                });
            },
            { threshold, rootMargin: '0px 0px -60px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    const hiddenTransform = {
        up: 'translate-y-10',
        down: '-translate-y-10',
        left: 'translate-x-10',
        right: '-translate-x-10',
        none: '',
    }[direction] || 'translate-y-10';

    return (
        <Tag
            ref={ref}
            className={`transition-all ease-out ${visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${hiddenTransform}`} ${className}`}
            style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms`, willChange: 'opacity, transform' }}
            {...rest}
        >
            {children}
        </Tag>
    );
};

export default Reveal;
