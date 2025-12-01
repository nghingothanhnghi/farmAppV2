
import { useCallback, useEffect, useState } from "react"
import type { ComponentPropsWithRef } from "react"
import type { EmblaCarouselType } from "embla-carousel"

export function usePrevNextButtons(emblaApi?: EmblaCarouselType) {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const onPrevButtonClick = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const onNextButtonClick = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setPrevBtnDisabled(!api.canScrollPrev())
    setNextBtnDisabled(!api.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    emblaApi.on("select", onSelect).on("reInit", onSelect)
  }, [emblaApi, onSelect])

  return { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick }
}

type BtnProps = ComponentPropsWithRef<"button">

export function PrevButton(props: BtnProps) {
  return (
    <button className="embla__button embla__button--prev" {...props}>
      ◀
    </button>
  )
}

export function NextButton(props: BtnProps) {
  return (
    <button className="embla__button embla__button--next" {...props}>
      ▶
    </button>
  )
}
