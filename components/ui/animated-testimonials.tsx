"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  accentColor = "#ffffff",
}: {
  testimonials: Testimonial[];
  autoplay?: boolean; // kept for API compat, ignored
  accentColor?: string;
}) => {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNext = () => setActive((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const isActive = (index: number) => index === active;

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  const current = testimonials[active];
  const isLong = current.quote.length > 200;

  return (
    <>
      <div className="mx-auto max-w-sm px-4 py-10 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">

          {/* Columna izquierda: imagen + flechas centradas */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-80 w-full">
              <AnimatePresence>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.src}
                    initial={{ opacity: 0, scale: 0.9, z: -100, rotate: randomRotateY() }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.7,
                      scale: isActive(index) ? 1 : 0.95,
                      z: isActive(index) ? 0 : -100,
                      rotate: isActive(index) ? 0 : randomRotateY(),
                      zIndex: isActive(index) ? 40 : testimonials.length + 2 - index,
                      y: isActive(index) ? [0, -80, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, z: 100, rotate: randomRotateY() }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom"
                  >
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover object-center"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Flechas centradas */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="group/button flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <IconArrowLeft className="h-5 w-5 text-white transition-transform duration-300 group-hover/button:rotate-12" />
              </button>
              <button
                onClick={handleNext}
                className="group/button flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <IconArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover/button:-rotate-12" />
              </button>
            </div>
          </div>

          {/* Columna derecha: texto */}
          <div className="flex flex-col gap-3 py-2">
            <motion.div
              key={active}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-3"
            >
              <h3 className="text-2xl font-bold leading-tight" style={{ color: accentColor }}>
                {current.name}
              </h3>
              <span
                className="self-start rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: accentColor + "55", border: `1px solid ${accentColor}99` }}
              >
                {current.designation}
              </span>
              <motion.p className="text-sm text-white/80 leading-relaxed line-clamp-[10]">
                {current.quote.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
              {isLong && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="self-start mt-1 text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: accentColor }}
                >
                  Ver más
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/20"
            style={{ background: "rgba(20,20,20,0.92)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.name}
              className="w-full h-56 object-cover object-center"
            />
            <div className="p-6 flex flex-col gap-3">
              <h3 className="text-xl font-bold" style={{ color: accentColor }}>
                {current.name}
              </h3>
              <span
                className="self-start rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: accentColor + "55", border: `1px solid ${accentColor}99` }}
              >
                {current.designation}
              </span>
              <p className="text-sm text-white/80 leading-relaxed">{current.quote}</p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white/70 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
