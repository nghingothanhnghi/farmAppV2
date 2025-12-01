import { useCallback, useEffect, useState } from "react"
import type { ComponentPropsWithRef } from "react"
import type { EmblaCarouselType } from "embla-carousel"

export function useDotButton(emblaApi?: EmblaCarouselType) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onDotButtonClick = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const onInit = useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList())
  }, [])

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("select", onSelect).on("reInit", () => {
      onInit(emblaApi)
      onSelect(emblaApi)
    })
  }, [emblaApi])

  return { selectedIndex, scrollSnaps, onDotButtonClick }
}

type DotProps = ComponentPropsWithRef<"button">

export function DotButton(props: DotProps) {
  return (
    <button className="embla__dot" {...props}>
      ●
    </button>
  )
}