import React from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaOptionsType } from "embla-carousel"
import { PrevButton, NextButton, usePrevNextButtons } from "./CarouselArrowButtons"
import { DotButton, useDotButton } from "./CarouselDotButtons"

type CarouselProps = {
  children: React.ReactNode
  options?: EmblaOptionsType
  className?: string
}

export default function Carousel({ children, options, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi)

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  return (
    <section className={className ?? "embla"}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {React.Children.map(children, (child, idx) => (
            <div className="embla__slide flex-[0_0_100%]" key={idx}>
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton
            disabled={prevBtnDisabled}
            onClick={onPrevButtonClick}
          />
          <NextButton
            disabled={nextBtnDisabled}
            onClick={onNextButtonClick}
          />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, idx) => (
            <DotButton
              key={idx}
              onClick={() => onDotButtonClick(idx)}
              className={idx === selectedIndex ? "embla__dot--selected" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
